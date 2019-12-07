import "reflect-metadata";
import { Container } from "inversify";
import { TYPE, Interfaces } from "inversify-socket-utils";
import GameController from "../controllers/GameController";
import types from "./types.config";
import PlayerService from "../services/PlayerService";
import State from "../store/State";
import CardService from "../services/CardService";
import GameService from "../services/GameService";

const container = new Container();

container
    .bind(types.State)
    .to(State)
    .inSingletonScope();

container
    .bind(types.PlayerService)
    .to(PlayerService)
    .inSingletonScope();

container
    .bind(types.CardService)
    .to(CardService)
    .inSingletonScope();

container
    .bind(types.GameService)
    .to(GameService)
    .inSingletonScope();

container.bind<Interfaces.Controller>(TYPE.Controller).to(GameController);

export { container };
