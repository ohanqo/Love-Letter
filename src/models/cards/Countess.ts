import Card from "./Card";

export default class Countess extends Card {
    public name = "Comtesse";
    public value = 8;
    public isPassive = true;

    public action() {
        console.log(
            `${this.name} jouer cette carte si vous disposez d'un prince ou d'un roi.`,
        );
    }
}
