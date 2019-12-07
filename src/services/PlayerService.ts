import { injectable, inject } from "inversify";
import typesConfig from "../configs/types.config";
import State from "../store/State";
import rulesConfig from "../configs/rules.config";
import Player from "../models/Player";

@injectable()
export default class PlayerService {
    public state: State;

    public constructor(@inject(typesConfig.State) state: State) {
        this.state = state;
    }

    public addPlayer(id: string, username: string) {
        const player = new Player(id, username);
        this.state.players.push(player);
    }

    public isGameFull(): boolean {
        return this.state.players.length >= rulesConfig.MAX_PLAYERS;
    }

    public isAlreadyConnected(id: string): boolean {
        return this.state.players.some((p: Player) => p.id === id);
    }
}
