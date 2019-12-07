import Baron from "../models/cards/Baron";
import Chancellor from "../models/cards/Chancellor";
import Countess from "../models/cards/Countess";
import Guard from "../models/cards/Guard";
import Handmaiden from "../models/cards/Handmaiden";
import King from "../models/cards/King";
import Priest from "../models/cards/Priest";
import Prince from "../models/cards/Prince";
import Princess from "../models/cards/Princess";
import Spy from "../models/cards/Spy";
import Card from "../models/cards/Card";

interface CardMapping {
    name: string;
    type: new () => Card;
    amount: number;
}

// tslint:disable: object-literal-key-quotes
const cards: CardMapping[] = [
    {
        "name": "Baron",
        "type": Baron,
        "amount": 2,
    },
    {
        "name": "Chancellor",
        "type": Chancellor,
        "amount": 2,
    },
    {
        "name": "Countess",
        "type": Countess,
        "amount": 1,
    },
    {
        "name": "Guard",
        "type": Guard,
        "amount": 6,
    },
    {
        "name": "Handmaiden",
        "type": Handmaiden,
        "amount": 2,
    },
    {
        "name": "King",
        "type": King,
        "amount": 1,
    },
    {
        "name": "Priest",
        "type": Priest,
        "amount": 2,
    },
    {
        "name": "Prince",
        "type": Prince,
        "amount": 2,
    },
    {
        "name": "Princess",
        "type": Princess,
        "amount": 1,
    },
    {
        "name": "Spy",
        "type": Spy,
        "amount": 2,
    },
];

export { cards, CardMapping };
