import { injectable } from "inversify";
import Player from "../models/Player";
import Card from "../models/cards/Card";

@injectable()
export default class State {
    public deckCards: Card[] = [];
    public burnedCard?: Card;
    public players: Player[] = [];
    public previousWinner?: Player;
    public isRoundStarted = false;

    public resetCards() {
        this.deckCards = [];
        this.burnedCard = undefined;
    }

    public resetState() {
        this.resetCards();
        this.players = [];
        this.previousWinner = undefined;
        this.isRoundStarted = false;
    }
}
