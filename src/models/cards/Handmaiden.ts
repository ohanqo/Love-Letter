import Card from "./Card";
import { injectable } from "inversify";

@injectable()
export default class Handmaiden extends Card {
    public name = "Servante";
    public value = 4;
    public isPassive = true;
}
