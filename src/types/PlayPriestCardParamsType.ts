import PlayPriestCardType from "./PlayPriestCardType";
import Chat from "../models/Chat";

export default interface PlayPriestCardParamsType {
    payload: PlayPriestCardType;
    onSuccess: () => void;
    onError: (message: Chat) => void;
}
