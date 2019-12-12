import Card from "./Card";
import { injectable } from "inversify";

@injectable()
export default class Guard extends Card {
    public name = "Garde";
    public value = 1;
    public isPassive = false;

    public action() {
        // TODO
    }
}
