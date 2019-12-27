import { v1 } from "uuid";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";
import { pull } from "lodash";
import Handmaiden from "./Handmaiden";
import Message from "../Message";
import { cardPlayed } from "../../configs/messages.config";

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

    public action(player: Player, dto: PlayCardDto): Message {
        return Message.success(`${player.name}${cardPlayed}${this.name}.`);
    }

    public updateToLooseStatus(player: Player) {
        const card = player.cardsHand[0];
        pull(player.cardsHand, card);
        player.consumedCards.push(card);
        player.hasLost = true;
    }

    public isActiveHandmaiden(): boolean {
        return this.name === "Servante" && this.isDiscarded === false;
    }
}
