import { injectable } from "inversify";
import PlayCardType from "../types/PlayCardType";
import {
    hasToPickCard,
    cantPlayPrincess,
    hasToPlayCountess,
    hasLost,
    targetHasLost,
    defaultError,
} from "../configs/gameevents.config";
import Princess from "../models/cards/Princess";
import PlayCardParamsType from "../types/PlayCardParamsType";
import PlayPriestCardParamsType from "../types/PlayPriestCardParamsType";
import PlayPriestCardType from "../types/PlayPriestCardType";
import Chat from "../models/Chat";

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
    }: PlayCardType): Chat | undefined {
        let message: Chat;

        if (player.hasLost) {
            message = new Chat(hasLost);
        } else if (player.hasToPickCard()) {
            message = new Chat(hasToPickCard);
        } else if (cardToPlay instanceof Princess) {
            message = new Chat(cantPlayPrincess);
        } else if (
            cardToPlay.name !== "Comtesse" &&
            player.hasToPlayCountess()
        ) {
            message = new Chat(hasToPlayCountess);
        }

        return message;
    }

    private getPlayPriestCardPotentialErrorMessage({
        player,
        target,
    }: PlayPriestCardType): Chat | undefined {
        let message: Chat;

        if (player.hasLost) {
            message = new Chat(hasLost);
        } else if (player.hasToPickCard()) {
            message = new Chat(hasToPickCard);
        } else if (!target) {
            message = new Chat(defaultError);
        } else if (target.hasLost) {
            message = new Chat(targetHasLost);
        }

        return message;
    }
}
