import Card from "./Card";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";
import { pull } from "lodash";
import { kingPlayed } from "../../configs/gameevents.config";
import Chat from "../Chat";

@injectable()
export default class King extends Card {
    public name = "Roi";
    public value = 7;
    public isPassive = false;

    public action(player: Player, { targetId }: PlayCardDto): Chat {
        return this.getAttackableTarget({
            targetId,
            onSuccess: (target: Player) => {
                this.swapCards(player, target);
                return new Chat(`${player.name}${kingPlayed}${target.name}`);
            },
            onError: (message: Chat) => message,
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
