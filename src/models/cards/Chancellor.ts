import Card from "./Card";
import { injectable } from "inversify";

@injectable()
export default class Chancellor extends Card {
    public name = "Chancelier";
    public value = 6;
    public isPassive = true;
}
