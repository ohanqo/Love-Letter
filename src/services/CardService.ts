import { injectable, inject } from "inversify";
import State from "../store/State";
import typesConfig from "../configs/types.config";
import { cards, CardMapping } from "../configs/cards.config";
import Card from "../models/cards/Card";
import * as _ from "lodash";
import Player from "../models/Player";

@injectable()
export default class CardService {
    public constructor(
        @inject(typesConfig.State)
        public state: State,
        @inject(typesConfig.CardFactory)
        public cardFactory: (named: string) => Card,
    ) {}

    public shuffle() {
        this.state.resetCards();

        cards.forEach((card: CardMapping) => {
            const cardList = this.getAmountOfCards(card.name, card.amount);
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

    public useCard(player: Player, card: Card) {
        _.pull(player.cardsHand, card);
        player.consumedCards.push(card);
    }

    public pickCards(amount: number): Card[] {
        const pickedCards: Card[] = [];

        for (let i = 0; i < amount; i++) {
            const cardPicked = this.pickCard();

            if (cardPicked) {
                pickedCards.push(cardPicked);
            }
        }

        return pickedCards;
    }

    private getAmountOfCards(cardName: string, amount: number): Card[] {
        const cardList: Card[] = [];

        for (let i = 0; i < amount; i++) {
            cardList.push(this.cardFactory(cardName));
        }

        return cardList;
    }
}
