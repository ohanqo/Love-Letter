import PlayCardType from "./PlayCardType";
import Message from "../models/Message";

export default interface PlayCardParamsType {
    payload: PlayCardType;
    onSuccess: () => void;
    onError: (msg: Message) => void;
}
