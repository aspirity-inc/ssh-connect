import { Connection } from "ssh2";
import { config } from "./config";
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
      connectionData.username = authCtx.username;
      const passwordRequired = !!config.password;

      if (passwordRequired) {
        if (authCtx.method !== "password") {
          authCtx.reject(["password"]);
          return;
        }
        if (authCtx.password === config.password) {
          authCtx.accept();
          return;
        }
        authCtx.reject([]);
        return;
      }

      if (authCtx.method === "none") {
        authCtx.accept();
        return;
      }
      authCtx.reject();
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
