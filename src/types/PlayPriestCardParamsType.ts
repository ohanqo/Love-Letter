import PlayPriestCardType from "./PlayPriestCardType";
import Message from "../models/Message";

export default interface PlayPriestCardParamsType {
    payload: PlayPriestCardType;
    onSuccess: () => void;
    onError: (message: Message) => void;
}
