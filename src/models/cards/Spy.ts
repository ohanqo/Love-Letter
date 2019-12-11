import Card from "./Card";
import { injectable } from "inversify";

@injectable()
export default class Spy extends Card {
    public name = "Espionne";
    public value = 0;
    public isPassive = true;

    public action() {
        console.log(
            `${this.name} gagnez 1 piont faveur si personne ne joue/defausse une Espionne`,
        );
    }
}
