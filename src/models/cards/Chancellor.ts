import Card from "./Card";
import { injectable } from "inversify";

@injectable()
export default class Chancellor extends Card {
    public name = "Chancelier";
    public value = 6;
    public isPassive = true;

    public action() {
        console.log(
            `${this.name} pioche deux cartes supplémentaire et en repose deux à la fin du paquet.`,
        );
    }
}
