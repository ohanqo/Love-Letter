import { injectable } from "inversify";
import PlayCardType from "../types/PlayCardType";
import Message from "../models/Message";
import {
    hasToPickCard,
    cantPlayPrincess,
    hasToPlayCountess,
} from "../configs/messages.config";
import Princess from "../models/cards/Princess";
import PlayCardParamsType from "../types/PlayCardParamsType";

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
}
