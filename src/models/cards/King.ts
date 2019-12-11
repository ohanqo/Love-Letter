import Card from "./Card";
import { injectable } from "inversify";

@injectable()
export default class King extends Card {
    public name = "Roi";
    public value = 7;
    public isPassive = false;

    public action() {
        console.log(
            `${this.name} échangez votre main avec celle d'un adversaire.`,
        );
    }
}
