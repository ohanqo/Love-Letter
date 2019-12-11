import Card from "./Card";
import { injectable } from "inversify";

@injectable()
export default class Prince extends Card {
    public name = "Prince";
    public value = 5;
    public isPassive = false;

    public action() {
        console.log(
            `${this.name} faites défausser la carte d'un adversaire ou la votre.`,
        );
    }
}
