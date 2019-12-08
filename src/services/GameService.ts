import { injectable, inject } from "inversify";
import typesConfig from "../configs/types.config";
import State from "../store/State";
import CardService from "./CardService";
import PlayerService from "./PlayerService";
import Player from "../models/Player";

@injectable()
export default class GameService {
    public state: State;
    public cardService: CardService;
    public playerService: PlayerService;

    public constructor(
        @inject(typesConfig.State) state: State,
        @inject(typesConfig.CardService) cardService: CardService,
        @inject(typesConfig.PlayerService) playerService: PlayerService,
    ) {
        this.state = state;
        this.cardService = cardService;
        this.playerService = playerService;
    }

    public initNewRound() {
        this.cardService.shuffle();
        this.cardService.burnCard();
        this.distributeCards();
    }

    public distributeCardToPlayer(player: Player) {
        const potentialCard = this.cardService.pickCard();

        if (potentialCard) {
            player.cardsHand.push(potentialCard);
        }
    }

    private distributeCards() {
        this.state.players.map((p: Player) => this.distributeCardToPlayer(p));
    }
}
