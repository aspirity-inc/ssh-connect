import { Connection } from "ssh2";
import { handlePortForward } from "./port-forward-handler";
import { handleSession } from "./session-handler";
import { getConnectionData } from "./utils/connection-data";
import { logger } from "./utils/logger";

export function handleConnection(connection: Connection) {
  const connectionData = getConnectionData(connection);
  connection
    .on("authentication", (authCtx) => {
      logger.info("client authentication", {
        username: authCtx.username,
        service: authCtx.service,
        method: authCtx.method,
      });
      switch (authCtx.method) {
        case "none":
          connectionData.username = authCtx.username;
          authCtx.accept();
          break;
        default:
          authCtx.reject();
          break;
      }
    })
    .on("ready", () => {
      logger.info("client ready");
      connection.once("close", () => "connection close");
      connection.once("end", () => "connection end");
      connection.once("error", () => "connection error");
      handlePortForward(connection);
      handleSession(connection);
    });
}
