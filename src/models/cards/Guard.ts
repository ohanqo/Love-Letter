import Card from "./Card";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";
import Message from "../Message";
import { guardWin, guardFail } from "../../configs/messages.config";

@injectable()
export default class Guard extends Card {
    public name = "Garde";
    public value = 1;
    public isPassive = false;

    public action(
        player: Player,
        { targetId, guessCardName }: PlayCardDto,
    ): Message {
        return this.getAttackableTarget({
            targetId,
            onSuccess: (target: Player) =>
                this.attackTarget(player, target, guessCardName),
            onError: (message: Message) => message,
        });
    }

    public attackTarget(
        player: Player,
        target: Player,
        guessCardName: string,
    ): Message {
        const targetCard = target.cardsHand[0];

        if (targetCard && targetCard.name === guessCardName) {
            this.updateToLooseStatus(target);
            return Message.success(
                `${player.name}${guardWin}${target.name}: ${targetCard.name}`,
            );
        }

        return Message.error(`${player.name}${guardFail}${target.name}`);
    }
}
