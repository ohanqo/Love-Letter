import Player from "../models/Player";

export default interface ChatDto {
    player: Player;
    message: string;
}
