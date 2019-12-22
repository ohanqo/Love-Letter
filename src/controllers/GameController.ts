import { injectable, inject } from "inversify";
import {
    Controller,
    SocketIO,
    OnDisconnect,
    OnMessage,
    Payload,
    ConnectedSocket,
    SocketID,
} from "inversify-socket-utils";
import PlayerService from "../services/PlayerService";
import typesConfig from "../configs/types.config";
import events from "../events/events";
import State from "../store/State";
import GameService from "../services/GameService";
import CardService from "../services/CardService";
import PlayCardDto from "../dtos/PlayCardDto";
import rulesConfig from "../configs/rules.config";

@injectable()
@Controller("/")
export default class GameController {
    public constructor(
        @inject(typesConfig.State) public state: State,
        @inject(typesConfig.PlayerService) public playerService: PlayerService,
        @inject(typesConfig.CardService) public cardService: CardService,
        @inject(typesConfig.GameService) public gameService: GameService,
    ) {}

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
            const player = this.playerService.updatePlayerTurn();
            io.emit(events.StartRound, this.state.players);
            io.emit(events.PlayerTurn, player);
        }
    }

    @OnMessage(events.Pick)
    public onPick(@SocketID() id: string, @SocketIO() io: SocketIO.Server) {
        const player = this.playerService.findPlayer(id);

        if (this.playerService.canPickCard(player)) {
            this.gameService.distributeCardToPlayer(player);
            io.emit(events.CardPicked, this.state.players);
        }
    }

    @OnMessage(events.PlayCard)
    public onPlayCard(
        @SocketID() id: string,
        @SocketIO() io: SocketIO.Server,
        @Payload() playCardDto: PlayCardDto,
    ) {
        const player = this.playerService.findPlayer(id);
        const cardToPlay = player.findInHand(playCardDto.cardId);

        this.cardService.useCard(player, cardToPlay);
        cardToPlay?.action(player, playCardDto);
        io.emit(events.CardPlayed, this.state.players);
    }

    @OnMessage(events.PlayChancellorCard)
    public onPlayChancellorCard(
        @SocketID() id: string,
        @SocketIO() io: SocketIO.Server,
        @ConnectedSocket() socket: SocketIO.Socket,
    ) {
        // Use card ?
        const player = this.playerService.findPlayer(id);
        const pickedCards = this.cardService.pickCards(
            rulesConfig.CHANCELLOR_PICKED_CARD,
        );

        player.cardsHand.push(...pickedCards);
        io.emit(events.Players, this.state.players);
        socket.emit(events.ChancellorChooseCard);
    }

    @OnDisconnect("disconnect")
    public disconnect(@SocketID() id: string, @SocketIO() io: SocketIO.Server) {
        this.playerService.removePlayer(id);
        io.emit(events.Players, this.state.players);
        this.gameService.checkMinPlayers();
    }
}
