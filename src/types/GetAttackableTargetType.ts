import Message from "../models/Message";
import Player from "../models/Player";

export default interface GetAttackableTargetType {
    targetId?: string;
    onSuccess: (target: Player) => Message;
    onError: (msg: Message) => Message;
}
