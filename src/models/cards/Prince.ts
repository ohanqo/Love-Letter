import Card from "./Card";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";
import PlayerService from "../../services/PlayerService";
import { container } from "../../configs/inversify.config";
import typesConfig from "../../configs/types.config";
import CardService from "../../services/CardService";
import Princess from "./Princess";
import State from "../../store/State";

@injectable()
export default class Prince extends Card {
    public name = "Prince";
    public value = 5;
    public isPassive = false;

    public action(player: Player, { targetId }: PlayCardDto) {
        if (targetId) {
            const playerService = container.get<PlayerService>(
                typesConfig.PlayerService,
            );
            const cardService = container.get<CardService>(
                typesConfig.CardService,
            );

            const target = playerService.findPlayer(targetId);
            const card = target.cardsHand[0];

            cardService.useCard(target, card);

            if (card instanceof Princess) {
                this.updateToLooseStatus(target);
            } else {
                const pickedCard = cardService.pickCard();

                this.handleNewCardPick(target, pickedCard);
            }
        }
    }

    private handleNewCardPick(target: Player, pickedCard: Card) {
        if (pickedCard) {
            target.cardsHand.push(pickedCard);
        } else {
            const state = container.get<State>(typesConfig.State);
            target.cardsHand.push(state.burnedCard);
        }
    }
}
