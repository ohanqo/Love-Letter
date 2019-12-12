import Card from "./Card";
import { injectable } from "inversify";
import PlayCardDto from "../../dtos/PlayCardDto";
import Player from "../Player";
import { container } from "../../configs/inversify.config";
import PlayerService from "../../services/PlayerService";
import typesConfig from "../../configs/types.config";

@injectable()
export default class Baron extends Card {
    public name = "Baron";
    public value = 3;
    public isPassive = false;

    public action(player: Player, { targetId }: PlayCardDto) {
        if (targetId) {
            const playerService = container.get<PlayerService>(
                typesConfig.PlayerService,
            );

            const target = playerService.findPlayer(targetId);

            this.doBattle(player, target);
        }
    }

    private doBattle(player: Player, target?: Player) {
        const playerCard = player.cardsHand[0];
        const targetCard = target.cardsHand[0];

        if (playerCard && targetCard) {
            const playerValue = playerCard.value;
            const targetValue = targetCard.value;

            if (playerValue === targetValue) {
                return;
            } else if (playerValue > targetValue) {
                this.updateToLooseStatus(target);
            } else {
                this.updateToLooseStatus(player);
            }
        }
    }
}
