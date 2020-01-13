import Player from "../models/Player";

export default interface RoundResultDto {
    winners: Player[];
    others: Player[];
}
