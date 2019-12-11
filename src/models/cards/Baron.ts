import Card from "./Card";
import { injectable } from "inversify";

@injectable()
export default class Baron extends Card {
    public name = "Baron";
    public value = 3;
    public isPassive = false;

    public action() {}
}
