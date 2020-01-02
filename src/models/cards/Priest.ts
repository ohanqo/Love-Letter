import Card from "./Card";
import { injectable } from "inversify";

@injectable()
export default class Priest extends Card {
    public name = "Prêtre";
    public value = 2;
    public isPassive = false;
}
