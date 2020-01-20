import { injectable, inject } from "inversify";
import {
    Controller,
    SocketIO,
    OnDisconnect,
    OnMessage,
    Payload,
    ConnectedSocket,
    SocketID,
    OnConnect,
} from "inversify-socket-utils";
import PlayerService from "../services/PlayerService";
import typesConfig from "../configs/types.config";
import events from "../events/events";
import State from "../store/State";
import GameService from "../services/GameService";
import CardService from "../services/CardService";
import PlayCardDto from "../dtos/PlayCardDto";
import rulesConfig from "../configs/rules.config";
import Card from "../models/cards/Card";
import { tail } from "lodash";
import {
    pickedCard,
    cantPickCard,
    chancellorPlayed,
    hasToPickCard,
    hasSeenCard,
    hasNotSeenCard,
} from "../configs/gameevents.config";
import GameMiddleware from "../middlewares/GameMiddleware";
import PlayCardType from "../types/PlayCardType";
import PlayPriestCardType from "../types/PlayPriestCardType";
import Chat from "../models/Chat";

@injectable()
@Controller("/")
export default class GameController {
    public constructor(
        @inject(typesConfig.State) public state: State,
        @inject(typesConfig.PlayerService) public playerService: PlayerService,
        @inject(typesConfig.CardService) public cardService: CardService,
        @inject(typesConfig.GameService) public gameService: GameService,
        @inject(typesConfig.GameMiddleware) public middleware: GameMiddleware,
    ) {}

    @OnConnect("connection")
    public connection(@ConnectedSocket() socket: SocketIO.Socket) {
        socket.emit(events.Players, this.state.players);
    }

    @OnMessage(events.PlayerConnect)
    public onPlayerConnection(
        @Payload() username: string,
        @SocketIO() io: SocketIO.Server,
        @ConnectedSocket() socket: SocketIO.Socket,
    ) {
        if (this.playerService.isGameFull()) {
            socket.emit(events.GameFull);
        } else if (this.playerService.isAlreadyConnected(socket.id)) {
            socket.emit(events.AlreadyRegistered);
        } else {
            this.playerService.addPlayer(socket.id, username);
            socket.emit(events.CurrentPlayer, socket.id);
            io.emit(events.Players, this.state.players);
        }
    }

    @OnMessage(events.Play)
    public onPlay(
        @SocketIO() io: SocketIO.Server,
        @ConnectedSocket() socket: SocketIO.Socket,
    ) {
        if (!this.playerService.hasEnoughPlayers()) {
            socket.emit(events.NotEnoughPlayers);
        } else if (this.state.isRoundStarted) {
            socket.emit(events.AlreadyStarted);
        } else {
            this.gameService.initNewRound();
            const player = this.playerService.setFirstPlayerToPlay();
            io.emit(events.StartRound, this.state.players);
            io.emit(events.PlayerTurn, player);
            io.emit(events.NumberOfCardsLeft, this.state.deckCards.length);
        }
    }

    @OnMessage(events.Pick)
    public onPick(
        @SocketID() id: string,
        @SocketIO() io: SocketIO.Server,
        @ConnectedSocket() socket: SocketIO.Socket,
    ) {
        const player = this.playerService.findPlayer(id);

        if (this.playerService.canPickCard(player)) {
            this.gameService.distributeCardToPlayer(player);
            io.emit(events.CardPicked, this.state.players);
            io.emit(events.NumberOfCardsLeft, this.state.deckCards.length);
            socket.broadcast.emit(
                events.Chat,
                new Chat(`${player.name}${pickedCard}`),
            );
        } else {
            socket.emit(events.Chat, new Chat(cantPickCard));
        }
    }

    @OnMessage(events.PlayCard)
    public onPlayCard(
        @SocketID() id: string,
        @SocketIO() io: SocketIO.Server,
        @Payload() playCardDto: PlayCardDto,
        @ConnectedSocket() socket: SocketIO.Socket,
    ) {
        const player = this.playerService.findPlayer(id);
        const cardToPlay = player.findInHand(playCardDto.cardId);
        const payload: PlayCardType = { player, cardToPlay };

        this.middleware.playCard({
            payload,
            onSuccess: () => {
                this.cardService.useCard(player, cardToPlay);
                const message = cardToPlay?.action(player, playCardDto);
                this.gameService.switchPlayerTurn();
                io.emit(events.CardPlayed, this.state.players);
                io.emit(events.NumberOfCardsLeft, this.state.deckCards.length);
                io.emit(events.Chat, message);
                this.gameService.checkRoundEnd(io);
            },
            onError: (msg: Chat) => {
                socket.emit(events.Chat, msg);
            },
        });
    }

    @OnMessage(events.PlayChancellorCard)
    public onPlayChancellorCard(
        @SocketID() id: string,
        @SocketIO() io: SocketIO.Server,
        @Payload() playCardDto: PlayCardDto,
        @ConnectedSocket() socket: SocketIO.Socket,
    ) {
        const player = this.playerService.findPlayer(id);

        if (player.hasToPickCard()) {
            const msg = new Chat(hasToPickCard);
            socket.emit(events.Chat, msg);
            return;
        }

        const cardToPlay = player.findInHand(playCardDto.cardId);
        const pickedCards = this.cardService.pickCards(
            rulesConfig.CHANCELLOR_PICKED_CARD,
        );

        this.cardService.useCard(player, cardToPlay);
        player.cardsHand.push(...pickedCards);
        io.emit(events.Players, this.state.players);
        io.emit(events.Chat, new Chat(`${player.name}${chancellorPlayed}`));
        socket.emit(events.ChancellorChooseCard);
    }

    @OnMessage(events.ChancellorPlacedCard)
    public onChancellorPlacedCard(
        @SocketID() id: string,
        @SocketIO() io: SocketIO.Server,
        @Payload() placedCards: Card[],
    ) {
        const player = this.playerService.findPlayer(id);
        const cardToKeepInHand = player.findInHand(placedCards[0].id);
        const cardsHandRefs = this.cardService.filterRefsById(
            player.cardsHand,
            placedCards,
        );
        const cardsToPutInDeck = tail(cardsHandRefs);

        player.cardsHand = [];
        player.cardsHand.push(cardToKeepInHand);
        this.cardService.pushCards(cardsToPutInDeck);
        this.gameService.switchPlayerTurn();
        io.emit(events.CardPlayed, this.state.players);
        io.emit(events.NumberOfCardsLeft, this.state.deckCards.length);
        this.gameService.checkRoundEnd(io);
    }

    @OnMessage(events.PlayPriestCard)
    public onPlayPriestCard(
        @SocketID() id: string,
        @SocketIO() io: SocketIO.Server,
        @Payload() { cardId, targetId }: PlayCardDto,
        @ConnectedSocket() socket: SocketIO.Socket,
    ) {
        const player = this.playerService.findPlayer(id);
        const target = this.playerService.findPlayer(targetId);
        const payload: PlayPriestCardType = { player, target };

        this.middleware.playPriestCard({
            payload,
            onSuccess: () => {
                const cardToPlay = player.findInHand(cardId);
                const targetCard = target.isProtected()
                    ? null
                    : target.cardsHand[0];

                socket.emit(events.ShowTargetCard, targetCard);
                targetCard
                    ? io.emit(
                          events.Chat,
                          new Chat(
                              `${player.name} ${hasSeenCard} ${target.name}`,
                          ),
                      )
                    : io.emit(
                          events.Chat,
                          new Chat(
                              `${player.name} ${hasNotSeenCard} ${target.name}`,
                          ),
                      );
                this.cardService.useCard(player, cardToPlay);
                this.gameService.switchPlayerTurn();

                io.emit(events.CardPlayed, this.state.players);
                io.emit(events.NumberOfCardsLeft, this.state.deckCards.length);
                this.gameService.checkRoundEnd(io);
            },
            onError: (message: Chat) => {
                socket.emit(events.Chat, message);
            },
        });
    }

    @OnMessage(events.Chat)
    public onMessage(@SocketIO() io: SocketIO.Server, @Payload() chat: Chat) {
        io.emit(events.Chat, chat);
    }

    @OnDisconnect("disconnect")
    public disconnect(@SocketID() id: string, @SocketIO() io: SocketIO.Server) {
        this.playerService.removePlayer(id);
        this.gameService.resetIfNotEnoughPlayer();
        io.emit(events.Players, this.state.players);
    }
}
