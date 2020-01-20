import Player from "../models/Player";
import Chat from "../models/Chat";

export default interface GetAttackableTargetType {
    targetId?: string;
    onSuccess: (target: Player) => Chat;
    onError: (msg: Chat) => Chat;
}
