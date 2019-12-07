import Card from "./Card";

export default class Priest extends Card {
    public name = "Prêtre";
    public value = 2;
    public isPassive = false;

    public action() {
        console.log(`${this.name} visualisez la carte d'un adversaire`);
    }
}
