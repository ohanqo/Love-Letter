import { v1 } from "uuid";
import { injectable } from "inversify";
import Player from "../Player";
import PlayCardDto from "../../dtos/PlayCardDto";
import Message from "../Message";
import {
    cardPlayed,
    cantAttackTarget,
    targetHasLost,
} from "../../configs/messages.config";
import { container } from "../../configs/inversify.config";
import CardService from "../../services/CardService";
import typesConfig from "../../configs/types.config";
import GetAttackableTargetType from "../../types/GetAttackableTargetType";
import PlayerService from "../../services/PlayerService";

@injectable()
export default abstract class Card {
    public id = "unknown";
    public name = "unknown";
    public value = 0;
    public isPassive = true;
    public isBurned = false;
    public isDiscarded = false;

    public constructor() {
        this.id = v1();
    }

    public action(player: Player, dto: PlayCardDto): Message {
        return Message.success(`${player.name}${cardPlayed}${this.name}.`);
    }

    public updateToLooseStatus(player: Player) {
        const card = player.cardsHand[0];
        const cardService = container.get<CardService>(typesConfig.CardService);
        cardService.useCard(player, card);
        player.hasLost = true;
    }

    public getAttackableTarget({
        targetId,
        onSuccess,
        onError,
    }: GetAttackableTargetType): Message {
        const playerService = container.get<PlayerService>(
            typesConfig.PlayerService,
        );
        const target = playerService.findPlayer(targetId);

        if (!target) {
            return onError(Message.error());
        } else if (target.isProtected()) {
            return onError(Message.error(cantAttackTarget));
        } else if (target.hasLost) {
            return onError(Message.error(targetHasLost));
        }

        return onSuccess(target);
    }

    public isActiveHandmaiden(): boolean {
        return this.name === "Servante" && this.isDiscarded === false;
    }
}
