import Card from "./Card";

export default class Princess extends Card {
    public name = "Princesse";
    public value = 9;
    public isPassive = true;

    public action() {
        console.log(`${this.name} ne doit pas être défaussé`);
    }
}
