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
} from "../configs/messages.config";
import Message from "../models/Message";
import GameMiddleware from "../middlewares/GameMiddleware";
import PlayCardType from "../types/PlayCardType";
import PlayPriestCardType from "../types/PlayPriestCardType";

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
            socket.broadcast.emit(
                events.Message,
                Message.success(`${player.name}${pickedCard}`),
            );
        } else {
            socket.emit(events.Message, Message.error(cantPickCard));
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
                io.emit(events.Message, message);
            },
            onError: (msg: Message) => {
                socket.emit(events.Message, msg);
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
            const msg = Message.error(hasToPickCard);
            socket.emit(events.Message, msg);
            return;
        }

        const cardToPlay = player.findInHand(playCardDto.cardId);
        const pickedCards = this.cardService.pickCards(
            rulesConfig.CHANCELLOR_PICKED_CARD,
        );

        this.cardService.useCard(player, cardToPlay);
        player.cardsHand.push(...pickedCards);
        io.emit(events.Players, this.state.players);
        io.emit(
            events.Message,
            Message.success(`${player.name}${chancellorPlayed}`),
        );
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
                const targetCard = target.cardsHand[0];

                this.cardService.useCard(player, cardToPlay);
                this.gameService.switchPlayerTurn();

                io.emit(events.CardPlayed, this.state.players);
                socket.emit(events.ShowTargetCard, targetCard);
            },
            onError: (message: Message) => {
                socket.emit(events.Message, message);
            },
        });
    }

    @OnDisconnect("disconnect")
    public disconnect(@SocketID() id: string, @SocketIO() io: SocketIO.Server) {
        this.playerService.removePlayer(id);
        this.gameService.resetIfNotEnoughPlayer();
        io.emit(events.Players, this.state.players);
    }
}
