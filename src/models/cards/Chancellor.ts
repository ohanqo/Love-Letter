import Card from "./Card";
import { injectable } from "inversify";
import PlayCardDto from "../../dtos/PlayCardDto";
import Player from "../Player";

@injectable()
export default class Chancellor extends Card {
    public name = "Chancelier";
    public value = 6;
    public isPassive = true;

    public action(player: Player, dto: PlayCardDto) {
        // TODO
    }
}
