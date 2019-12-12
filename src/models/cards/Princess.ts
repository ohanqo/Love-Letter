import Card from "./Card";
import { injectable } from "inversify";

@injectable()
export default class Princess extends Card {
    public name = "Princesse";
    public value = 9;
    public isPassive = true;

    public action() {
        return;
    }
}
