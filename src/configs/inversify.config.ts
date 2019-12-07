import "reflect-metadata";
import { Container } from "inversify";
import { Interfaces, TYPE } from "inversify-socket-utils";
import LobbyController from "../controllers/LobbyController";

const container = new Container();

container.bind<Interfaces.Controller>(TYPE.Controller).to(LobbyController);

export { container };
