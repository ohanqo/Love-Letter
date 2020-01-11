import { injectable, inject } from "inversify";
import typesConfig from "../configs/types.config";
import State from "../store/State";
import rulesConfig from "../configs/rules.config";
import Player from "../models/Player";
import * as _ from "lodash";

@injectable()
export default class PlayerService {
    public constructor(@inject(typesConfig.State) public state: State) {}

    public addPlayer(id: string, username: string) {
        const player = new Player(id, username);
        this.state.players.push(player);
    }

    public removePlayer(id: string) {
        _.remove(this.state.players, (p: Player) => p.id === id);
    }

    public findPlayer(id: string): Player {
        return this.state.players.find((p: Player) => p.id === id);
    }

    public setFirstPlayerToPlay(): Player {
        const player = this.state.previousWinner ?? this.getRandomPlayer();
        this.setCurrentPlayerTurn(player);
        return player;
    }

    public getRandomPlayer(): Player {
        const randomIndex = _.random(0, this.state.players.length - 1);
        return this.state.players[randomIndex];
    }

    public getNextPlayer(): Player {
        const alivePlayersWithCurrentPlayer = this.state.players.filter(
            (p: Player) => p.hasLost === false || p.isPlayerTurn,
        );

        const currentTurnPlayerIndex = alivePlayersWithCurrentPlayer.findIndex(
            (p: Player) => p.isPlayerTurn,
        );

        return (
            alivePlayersWithCurrentPlayer[currentTurnPlayerIndex + 1] ??
            alivePlayersWithCurrentPlayer[0]
        );
    }

    public setCurrentPlayerTurn(player: Player) {
        this.state.players.map((p: Player) => (p.isPlayerTurn = false));
        player.discardActiveHandmaiden();
        player.isPlayerTurn = true;
    }

    public getAlivePlayers(): Player[] {
        return this.state.players.filter((p: Player) => !p.hasLost);
    }

    public isGameFull(): boolean {
        return this.state.players.length >= rulesConfig.MAX_PLAYERS;
    }

    public isAlreadyConnected(id: string): boolean {
        return this.state.players.some((p: Player) => p.id === id);
    }

    public hasEnoughPlayers(): boolean {
        return this.state.players.length >= rulesConfig.MIN_PLAYERS;
    }

    public canPickCard(player: Player): boolean {
        return (
            player.isPlayerTurn &&
            player.cardsHand.length < rulesConfig.MAX_CARD_PER_HAND
        );
    }
}
