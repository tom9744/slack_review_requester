import express from "express";
import { createServer, Server } from "http";
import { SlackBolt } from "./bolt-app";

const EVENTS_END_POINT = "/slack/events";
const INTERACTIVITY_END_POINT = "/slack/interactive-endpoint";
const SLASH_COMMAND_END_POINT = "/slack/command";
const DEFAULT_PORT = 3030;

export interface ExpressServer {
  listen(): void;
}

class ExpressServerImpl implements ExpressServer {
  private readonly _server: Server;

  constructor(slackBolt: SlackBolt) {
    const expressApp = express();

    expressApp.get("/", (_, res) => {
      res.send("Review Requester Mark 2");
    });

    expressApp.use(EVENTS_END_POINT, slackBolt.app);
    expressApp.use(INTERACTIVITY_END_POINT, slackBolt.app);
    expressApp.use(SLASH_COMMAND_END_POINT, slackBolt.app);

    this._server = createServer(expressApp);
  }

  public listen(): void {
    const listeningListener = () => {
      console.log(
        `[LOG] Server is listening on port ${process.env.PORT ?? DEFAULT_PORT}`
      );
    };

    this._server.listen(process.env.PORT ?? DEFAULT_PORT, listeningListener);
  }
}

export const generateExpressServer = (slackBolt: SlackBolt): ExpressServer => {
  return new ExpressServerImpl(slackBolt);
};
