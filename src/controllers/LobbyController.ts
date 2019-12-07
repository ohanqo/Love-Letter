import { injectable } from "inversify";
import { Controller, OnConnect } from "inversify-socket-utils";

@injectable()
@Controller("/")
export default class LobbyController {
    @OnConnect("connection")
    public connection() {
        // tslint:disable-next-line: no-console
        console.log("LobbyController connection");
    }
}
