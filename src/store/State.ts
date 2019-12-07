import { injectable } from "inversify";
import Player from "../models/Player";
import Card from "../models/cards/Card";

@injectable()
export default class State {
    public players: Player[] = [];
    public deckCards: Card[] = [];
    public burnedCard?: Card;
    public isRoundStarted = false;
}
