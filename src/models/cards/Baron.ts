import Card from "./Card";
import { injectable } from "inversify";
import PlayCardDto from "../../dtos/PlayCardDto";
import Player from "../Player";
import { container } from "../../configs/inversify.config";
import PlayerService from "../../services/PlayerService";
import typesConfig from "../../configs/types.config";
import Message from "../Message";
import {
    cantAttackTarget,
    baronEqualCard,
    baronLoose,
} from "../../configs/messages.config";

@injectable()
export default class Baron extends Card {
    public name = "Baron";
    public value = 3;
    public isPassive = false;

    public action(player: Player, { targetId }: PlayCardDto): Message {
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

        this.doBattle(player, target);
    }

    private doBattle(player: Player, target?: Player) {
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
    }
}
