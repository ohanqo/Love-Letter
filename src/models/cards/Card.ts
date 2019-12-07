import { v1 } from "uuid";

export default abstract class Card {
    public id = "unknown";
    public name = "unknown";
    public value = 0;
    public isPassive = true;
    public isBurned = false;
    public isDiscarded = false;

    public constructor() {
        this.id = v1();
    }

    public action() {
        console.log(`${this.name} does nothing.`);
    }
}
