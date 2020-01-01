import Card from "./Card";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";
import { pull } from "lodash";
import Message from "../Message";
import { kingPlayed } from "../../configs/messages.config";

@injectable()
export default class King extends Card {
    public name = "Roi";
    public value = 7;
    public isPassive = false;

    public action(player: Player, { targetId }: PlayCardDto): Message {
        return this.getAttackableTarget({
            targetId,
            onSuccess: (target: Player) => {
                this.swapCards(player, target);
                return Message.success(
                    `${player.name}${kingPlayed}${target.name}`,
                );
            },
            onError: (message: Message) => message,
        });
    }

    public swapCards(player: Player, target: Player) {
        const playerCard = player.cardsHand[0];
        const targetCard = target.cardsHand[0];

        pull(player.cardsHand, playerCard);
        pull(target.cardsHand, targetCard);

        player.cardsHand.push(targetCard);
        target.cardsHand.push(playerCard);
    }
}
