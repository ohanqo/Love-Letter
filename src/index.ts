import "reflect-metadata";
import "dotenv/config";
import * as http from "http";
import * as SocketIO from "socket.io";
import { InversifySocketServer } from "inversify-socket-utils";
import { container } from "./configs/inversify.config";

const port = process.env.PORT ?? "3000";
const app = http.createServer();
const io = SocketIO(app);

const server = new InversifySocketServer(container, io);
server.build().listen(port);

// tslint:disable-next-line: no-console
console.log(`🚀 Server is listening on port ${port}`);
