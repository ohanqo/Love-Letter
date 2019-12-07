import Card from "./Card";

export default class Guard extends Card {
    public name = "Garde";
    public value = 1;
    public isPassive = false;

    public action() {
        console.log(
            `${this.name} devinez la carte d'un adversaire (ne pas devinez un garde).`,
        );
    }
}
