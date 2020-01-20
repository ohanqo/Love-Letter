import Card from "./Card";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";
import { guardWin, guardFail } from "../../configs/gameevents.config";
import Chat from "../Chat";

@injectable()
export default class Guard extends Card {
    public name = "Garde";
    public value = 1;
    public isPassive = false;

    public action(
        player: Player,
        { targetId, guessCardName }: PlayCardDto,
    ): Chat {
        return this.getAttackableTarget({
            targetId,
            onSuccess: (target: Player) =>
                this.attackTarget(player, target, guessCardName),
            onError: (message: Chat) => message,
        });
    }

    public attackTarget(
        player: Player,
        target: Player,
        guessCardName: string,
    ): Chat {
        const targetCard = target.cardsHand[0];

        if (targetCard && targetCard.name === guessCardName) {
            this.updateToLooseStatus(target);
            return new Chat(
                `${player.name}${guardWin}${target.name} (${targetCard.name})`,
            );
        }

        return new Chat(
            `${player.name}${guardFail}${target.name} (${guessCardName})`,
        );
    }
}
