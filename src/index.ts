import dotenv from "dotenv";
import { generateSlackBolt } from "./bolt-app";
import { generateExpressServer } from "./express-server";

dotenv.config();

const slackBolt = generateSlackBolt();
const expressServer = generateExpressServer(slackBolt);

expressServer.listen();
