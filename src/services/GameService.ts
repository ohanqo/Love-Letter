import { injectable, inject } from "inversify";
import typesConfig from "../configs/types.config";
import State from "../store/State";
import CardService from "./CardService";
import PlayerService from "./PlayerService";
import Player from "../models/Player";
import Card from "../models/cards/Card";
import events from "../events/events";

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

        alivePlayers
            .filter((p: Player) => p.cardsHand[0].value === winningValue)
            .map((p: Player) => (p.points += 1));
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
