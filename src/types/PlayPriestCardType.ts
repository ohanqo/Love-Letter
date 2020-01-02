import Player from "../models/Player";

export default interface PlayPriestCardType {
    player: Player;
    target?: Player;
}
