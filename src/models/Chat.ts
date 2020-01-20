import Player from "../models/Player";
import { GameEvent } from "../configs/chat.config";

export default class Chat {
    public constructor(
        public message: string,
        public player?: Player,
        public type: string = GameEvent,
    ) {}
}
