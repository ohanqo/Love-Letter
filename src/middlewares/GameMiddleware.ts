import { injectable } from "inversify";
import PlayCardType from "../types/PlayCardType";
import Message from "../models/Message";
import {
    hasToPickCard,
    cantPlayPrincess,
    hasToPlayCountess,
    cantAttackTarget,
} from "../configs/messages.config";
import Princess from "../models/cards/Princess";
import PlayCardParamsType from "../types/PlayCardParamsType";
import PlayPriestCardParamsType from "../types/PlayPriestCardParamsType";
import PlayPriestCardType from "../types/PlayPriestCardType";

@injectable()
export default class GameMiddleware {
    public playCard({ payload, onSuccess, onError }: PlayCardParamsType) {
        const message = this.getPlayCardPotentialErrorMessage(payload);

        if (message) {
            onError(message);
        } else {
            onSuccess();
        }
    }

    public playPriestCard({
        payload,
        onSuccess,
        onError,
    }: PlayPriestCardParamsType) {
        const message = this.getPlayPriestCardPotentialErrorMessage(payload);

        if (message) {
            onError(message);
        } else {
            onSuccess();
        }
    }

    private getPlayCardPotentialErrorMessage({
        player,
        cardToPlay,
    }: PlayCardType): Message | undefined {
        let message: Message;

        if (player.hasToPickCard()) {
            message = Message.error(hasToPickCard);
        } else if (cardToPlay instanceof Princess) {
            message = Message.error(cantPlayPrincess);
        } else if (player.hasToPlayCountess()) {
            message = Message.error(hasToPlayCountess);
        }

        return message;
    }

    private getPlayPriestCardPotentialErrorMessage({
        player,
        target,
    }: PlayPriestCardType): Message | undefined {
        let message: Message;

        if (player.hasToPickCard()) {
            message = Message.error(hasToPickCard);
        } else if (!target) {
            message = Message.error();
        } else if (target.isProtected()) {
            message = Message.error(cantAttackTarget);
        }

        return message;
    }
}
