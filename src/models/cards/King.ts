import Card from "./Card";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";
import { container } from "../../configs/inversify.config";
import PlayerService from "../../services/PlayerService";
import typesConfig from "../../configs/types.config";
import { pull } from "lodash";

@injectable()
export default class King extends Card {
    public name = "Roi";
    public value = 7;
    public isPassive = false;

    public action(player: Player, { targetId }: PlayCardDto) {
        if (targetId) {
            const playerService = container.get<PlayerService>(
                typesConfig.PlayerService,
            );

            const target = playerService.findPlayer(targetId);

            this.swapCards(player, target);
        }
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
