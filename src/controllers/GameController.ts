import { injectable, inject } from "inversify";
import { Controller, OnConnect, OnDisconnect } from "inversify-socket-utils";
import PlayerService from "../services/PlayerService";
import types from "../configs/types.config";

@injectable()
@Controller("/")
export default class GameController {
    public playerService: PlayerService;

    public constructor(
        @inject(types.PlayerService) playerService: PlayerService,
    ) {
        this.playerService = playerService;
    }

    @OnConnect("connection")
    public connection() {}

    @OnDisconnect("disconnect")
    public disconnect() {}
}
