import Card from "./Card";
import { injectable } from "inversify";
import PlayCardDto from "../../dtos/PlayCardDto";
import Player from "../Player";
import Message from "../Message";
import { baronEqualCard, baronLoose } from "../../configs/messages.config";

@injectable()
export default class Baron extends Card {
    public name = "Baron";
    public value = 3;
    public isPassive = false;

    public action(player: Player, { targetId }: PlayCardDto): Message {
        return this.getAttackableTarget({
            targetId,
            onSuccess: (target: Player) => this.doBattle(player, target),
            onError: (message: Message) => message,
        });
    }

    private doBattle(player: Player, target?: Player): Message {
        const playerCard = player.cardsHand[0];
        const targetCard = target.cardsHand[0];

        if (playerCard && targetCard) {
            const playerValue = playerCard.value;
            const targetValue = targetCard.value;

            if (playerValue === targetValue) {
                return Message.success(
                    `${player.name}${baronEqualCard}${target.name}`,
                );
            } else if (playerValue > targetValue) {
                this.updateToLooseStatus(target);
                return Message.success(
                    `${target.name}${baronLoose}${player.name}`,
                );
            } else {
                this.updateToLooseStatus(player);
                return Message.success(
                    `${player.name}${baronLoose}${target.name}`,
                );
            }
        }

        return Message.error();
    }
}
