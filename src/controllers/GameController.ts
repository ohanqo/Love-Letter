import { injectable, inject } from "inversify";
import {
    Controller,
    SocketIO,
    OnDisconnect,
    OnMessage,
    Payload,
    ConnectedSocket,
} from "inversify-socket-utils";
import PlayerService from "../services/PlayerService";
import typesConfig from "../configs/types.config";
import events from "../events/events";
import State from "../store/State";

@injectable()
@Controller("/")
export default class GameController {
    public state: State;
    public playerService: PlayerService;

    public constructor(
        @inject(typesConfig.State) state: State,
        @inject(typesConfig.PlayerService) playerService: PlayerService,
    ) {
        this.state = state;
        this.playerService = playerService;
    }

    @OnMessage(events.PlayerConnect)
    public onPlayerConnection(
        @Payload() username: string,
        @ConnectedSocket() socket: SocketIO.Socket,
        @SocketIO() io: SocketIO.Server,
    ) {
        if (this.playerService.isGameFull()) {
            socket.emit(events.GameFull);
        } else if (this.playerService.isAlreadyConnected(socket.id)) {
            socket.emit(events.AlreadyRegistered);
        } else {
            this.playerService.addPlayer(socket.id, username);
            io.emit(events.Players, this.state.players);
        }
    }

    @OnDisconnect("disconnect")
    public disconnect() {}
}
