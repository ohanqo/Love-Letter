import Card from "./Card";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";
import { container } from "../../configs/inversify.config";
import PlayerService from "../../services/PlayerService";
import typesConfig from "../../configs/types.config";
import Message from "../Message";
import {
    cantAttackTarget,
    guardWin,
    guardFail,
} from "../../configs/messages.config";

@injectable()
export default class Guard extends Card {
    public name = "Garde";
    public value = 1;
    public isPassive = false;

    public action(
        player: Player,
        { targetId, guessCardName }: PlayCardDto,
    ): Message {
        if (!targetId) {
            return Message.error();
        }

        const playerService = container.get<PlayerService>(
            typesConfig.PlayerService,
        );

        const target = playerService.findPlayer(targetId);

        if (target.isProtected()) {
            return Message.error(cantAttackTarget);
        }

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
