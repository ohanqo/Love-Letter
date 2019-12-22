import Card from "./cards/Card";

export default class Player {
    constructor(
        public id: string,
        public name: string,
        public cardsHand: Card[] = [],
        public consumedCards: Card[] = [],
        public isPlayerTurn = false,
        public hasLost = false,
    ) {}

    public findInHand(cardId: string): Card {
        return this.cardsHand.find((c: Card) => c.id === cardId);
    }
}
