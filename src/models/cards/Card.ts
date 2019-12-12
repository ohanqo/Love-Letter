import { v1 } from "uuid";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";

@injectable()
export default abstract class Card {
    public id = "unknown";
    public name = "unknown";
    public value = 0;
    public isPassive = true;
    public isBurned = false;
    public isDiscarded = false;

    public constructor() {
        this.id = v1();
    }

    public action(player: Player, playCardDto: PlayCardDto) {
        console.log(`${this.name} does nothing.`);
    }

    public updateToLooseStatus(player: Player) {
        
    }
}
