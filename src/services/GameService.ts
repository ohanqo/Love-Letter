import { injectable, inject } from "inversify";
import typesConfig from "../configs/types.config";
import State from "../store/State";
import CardService from "./CardService";
import PlayerService from "./PlayerService";
import Player from "../models/Player";
import rulesConfig from "../configs/rules.config";

@injectable()
export default class GameService {
    public constructor(
        @inject(typesConfig.State) public state: State,
        @inject(typesConfig.CardService) public cardService: CardService,
        @inject(typesConfig.PlayerService) public playerService: PlayerService,
    ) {}

    public initNewRound() {
        this.state.isRoundStarted = true;
        this.cardService.shuffle();
        this.cardService.burnCard();
        this.distributeCards();
    }

    public switchPlayerTurn() {
        const nextPlayer = this.playerService.getNextPlayer();
        this.playerService.setCurrentPlayerTurn(nextPlayer);
    }

    public distributeCardToPlayer(player: Player) {
        const potentialCard = this.cardService.pickCard();

        if (potentialCard) {
            player.cardsHand.push(potentialCard);
        }
    }

    public checkMinPlayers() {
        if (
            this.state.isRoundStarted &&
            this.state.players.length < rulesConfig.MIN_PLAYERS
        ) {
            this.state.resetState();
        }
    }

    private distributeCards() {
        this.state.players.map((p: Player) => this.distributeCardToPlayer(p));
    }
}
