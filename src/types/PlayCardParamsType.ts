import PlayCardType from "./PlayCardType";
import Chat from "../models/Chat";

export default interface PlayCardParamsType {
    payload: PlayCardType;
    onSuccess: () => void;
    onError: (msg: Chat) => void;
}
