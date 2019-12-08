import { injectable, inject } from "inversify";
import State from "../store/State";
import typesConfig from "../configs/types.config";
import { cards, CardMapping } from "../configs/cards.config";
import Card from "../models/cards/Card";
import * as _ from "lodash";

@injectable()
export default class CardService {
    public state: State;

    public constructor(@inject(typesConfig.State) state: State) {
        this.state = state;
    }

    public shuffle() {
        this.state.resetCards();

        cards.forEach((card: CardMapping) => {
            const cardList = this.getAmountOfCards(card.type, card.amount);
            this.state.deckCards.push(...cardList);
        });

        this.state.deckCards = _.shuffle(this.state.deckCards);
    }

    public burnCard() {
        const burnedCard = _.first(this.state.deckCards);
        this.state.burnedCard = burnedCard;
        _.pull(this.state.deckCards, burnedCard);
    }

    public hasRemainingCards(): boolean {
        return this.state.deckCards.length > 0;
    }

    public pickCard(): Card | undefined {
        const card = _.first(this.state.deckCards);
        _.pull(this.state.deckCards, card);
        return card;
    }

    private getAmountOfCards(card: new () => Card, amount: number): Card[] {
        const cardList: Card[] = [];

        for (let i = 0; i < amount; i++) {
            cardList.push(new card());
        }

        return cardList;
    }
}
