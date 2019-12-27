import Card from "./Card";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";
import Message from "../Message";

@injectable()
export default class Priest extends Card {
    public name = "Prêtre";
    public value = 2;
    public isPassive = false;

    public action(player: Player, dto: PlayCardDto): Message {
        return Message.success();
    }
}
