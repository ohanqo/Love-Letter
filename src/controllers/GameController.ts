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

@injectable()
@Controller("/")
export default class GameController {
    public state: State;
    public playerService: PlayerService;
    public cardService: CardService;
    public gameService: GameService;

    public constructor(
        @inject(typesConfig.State) state: State,
        @inject(typesConfig.PlayerService) playerService: PlayerService,
        @inject(typesConfig.CardService) cardService: CardService,
        @inject(typesConfig.GameService) gameService: GameService,
    ) {
        this.state = state;
        this.playerService = playerService;
        this.cardService = cardService;
        this.gameService = gameService;
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

    @OnDisconnect("disconnect")
    public disconnect(@SocketID() id: string, @SocketIO() io: SocketIO.Server) {
        this.playerService.removePlayer(id);
        io.emit(events.Players, this.state.players);
    }
}
