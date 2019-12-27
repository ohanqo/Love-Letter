import {
    success,
    defaultSuccess,
    error,
    defaultError,
} from "../configs/messages.config";

export default class Message {
    public static success(message: string = defaultSuccess): Message {
        return new this(message, success);
    }

    public static error(message: string = defaultError): Message {
        return new this(message, error);
    }

    private constructor(public message: string, public type: string) {}
}
