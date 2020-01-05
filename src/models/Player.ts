import Card from "./cards/Card";
import Countess from "./cards/Countess";
import Prince from "./cards/Prince";
import King from "./cards/King";
import rulesConfig from "../configs/rules.config";

export default class Player {
    constructor(
        public id: string,
        public name: string,
        public cardsHand: Card[] = [],
        public consumedCards: Card[] = [],
        public isPlayerTurn = false,
        public hasLost = false,
        public points = 0
    ) {}

    public findInHand(cardId: string): Card {
        return this.cardsHand.find((c: Card) => c.id === cardId);
    }

    public discardActiveHandmaiden() {
        this.consumedCards.map((c: Card) => {
            if (c.isActiveHandmaiden()) {
                c.isDiscarded = true;
            }
        });
    }

    public isProtected(): boolean {
        return this.consumedCards.some((c: Card) => c.isActiveHandmaiden());
    }

    public hasToPickCard(): boolean {
        return this.cardsHand.length < rulesConfig.MAX_CARD_PER_HAND;
    }

    public hasToPlayCountess(): boolean {
        return (
            this.cardsHand.some((c: Card) => c instanceof Countess) &&
            (this.cardsHand.some((c: Card) => c instanceof Prince) ||
                this.cardsHand.some((c: Card) => c instanceof King))
        );
    }
}
