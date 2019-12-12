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
}
