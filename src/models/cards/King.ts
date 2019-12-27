import Card from "./Card";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";
import { container } from "../../configs/inversify.config";
import PlayerService from "../../services/PlayerService";
import typesConfig from "../../configs/types.config";
import { pull } from "lodash";
import Message from "../Message";
import { cantAttackTarget, kingPlayed } from "../../configs/messages.config";

@injectable()
export default class King extends Card {
    public name = "Roi";
    public value = 7;
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

        this.swapCards(player, target);

        return Message.success(`${player.name}${kingPlayed}${target.name}`);
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
