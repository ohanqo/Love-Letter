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
import Message from "../Message";
import {
    cantAttackTarget,
    princessDiscard,
    princePlayed,
} from "../../configs/messages.config";

@injectable()
export default class Prince extends Card {
    public name = "Prince";
    public value = 5;
    public isPassive = false;

    public action(player: Player, { targetId }: PlayCardDto): Message {
        if (!targetId) {
            return Message.error();
        }

        const playerService = container.get<PlayerService>(
            typesConfig.PlayerService,
        );
        const cardService = container.get<CardService>(typesConfig.CardService);

        const target = playerService.findPlayer(targetId);

        if (target.isProtected()) {
            return Message.error(cantAttackTarget);
        }

        const card = target.cardsHand[0];

        cardService.useCard(target, card);

        if (card instanceof Princess) {
            this.updateToLooseStatus(target);
            return Message.success(`${target.name}${princessDiscard}`);
        } else {
            const pickedCard = cardService.pickCard();

            this.handleNewCardPick(target, pickedCard);
            return Message.success(
                `${player.name}${princePlayed}${target.name}: ${card.name}`,
            );
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
