import Player from "../models/Player";
import Card from "../models/cards/Card";

export default interface PlayCardType {
    player: Player;
    cardToPlay?: Card;
}
