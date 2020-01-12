import { injectable, inject } from "inversify";
import typesConfig from "../configs/types.config";
import State from "../store/State";
import CardService from "./CardService";
import PlayerService from "./PlayerService";
import Player from "../models/Player";
import Card from "../models/cards/Card";
import events from "../events/events";
import rulesConfig from "../configs/rules.config";
import { random } from "lodash";

@injectable()
export default class GameService {
    public constructor(
        @inject(typesConfig.State) public state: State,
        @inject(typesConfig.CardService) public cardService: CardService,
        @inject(typesConfig.PlayerService) public playerService: PlayerService,
    ) {}

    public initNewRound() {
        this.state.isRoundStarted = true;
        this.cardService.shuffle();
        this.cardService.burnCard();
        this.distributeCards();
    }

    public switchPlayerTurn() {
        const nextPlayer = this.playerService.getNextPlayer();
        this.playerService.setCurrentPlayerTurn(nextPlayer);
    }

    public distributeCardToPlayer(player: Player) {
        const potentialCard = this.cardService.pickCard();

        if (potentialCard) {
            player.cardsHand.push(potentialCard);
        }
    }

    public checkRoundEnd(io: SocketIO.Server) {
        const alivePlayers = this.playerService.getAlivePlayers();

        if (this.isRoundEnded(alivePlayers)) {
            this.addWinnersPoint(alivePlayers);
            this.addSpiesPoint(alivePlayers);
            this.state.isRoundStarted = false;
            io.emit(events.RoundEnded, alivePlayers);
            this.checkGameEnd(io);
        }
    }

    public resetIfNotEnoughPlayer() {
        if (
            this.state.isRoundStarted &&
            !this.playerService.hasEnoughPlayers()
        ) {
            this.state.resetState();
        }
    }

    private checkGameEnd(io: SocketIO.Server) {
        const winners = this.playersWithEnoughFavors();

        if (winners.length > 0) {
            io.emit(events.GameEnded, winners);
            this.state.resetPlayers(true);
        }
    }

    private playersWithEnoughFavors(): Player[] {
        const numberOfPointsToWin = this.getNumberOfFavorsToWin();

        return this.state.players.filter(
            (p: Player) => p.points >= numberOfPointsToWin,
        );
    }

    private getNumberOfFavorsToWin(): number {
        const numberOfPlayers = this.state.players.length;
        const favorsByPlayers = rulesConfig.NUMBER_OF_FAVORS / numberOfPlayers;
        return numberOfPlayers === 2
            ? Math.floor(favorsByPlayers)
            : Math.ceil(favorsByPlayers);
    }

    private distributeCards() {
        this.state.players.map((p: Player) => this.distributeCardToPlayer(p));
    }

    private addWinnersPoint(alivePlayers: Player[]) {
        const winningValue = alivePlayers
            .map((p: Player) => p.cardsHand[0])
            .map((c: Card) => c.value)
            .reduce((prevValue: number, currValue: number) =>
                prevValue > currValue ? prevValue : currValue,
            );

        const winners = alivePlayers.filter(
            (p: Player) => p.cardsHand[0].value === winningValue,
        );

        winners.map((p: Player) => (p.points += 1));

        this.assignWinnerToStartTheNextRound(winners);
    }

    private assignWinnerToStartTheNextRound(winners: Player[]) {
        const randomWinnerIndex = random(0, winners.length - 1);
        this.state.previousWinner = winners[randomWinnerIndex];
    }

    private addSpiesPoint(alivePlayers: Player[]) {
        const playersWithSpy = alivePlayers.filter((p: Player) =>
            p.consumedCards.some((c: Card) => c.name === "Espionne"),
        );

        if (playersWithSpy.length === 1) {
            playersWithSpy[0].points += 1;
        }
    }

    private isRoundEnded(alivePlayers: Player[]) {
        return alivePlayers.length === 1 || this.state.deckCards.length === 0;
    }
}
