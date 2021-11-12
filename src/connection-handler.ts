import { Connection } from "ssh2";
import { config } from "./config";
import { handlePortForward } from "./port-forward-handler";
import { handleSession } from "./session-handler";
import { getConnectionData } from "./utils/connection-data";
import { getConnectionLogger } from "./utils/logger";

export function handleConnection(connection: Connection) {
  const connectionData = getConnectionData(connection);
  connection
    .on("authentication", (authCtx) => {
      const connectionLogger = getConnectionLogger(connection);
      connectionLogger.info("client authentication", {
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
        connectionLogger.info("wrong password", {
          username: authCtx.username,
          password: authCtx.password,
        });
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
      getConnectionLogger(connection).info("client ready");
      connection.once("close", () => "connection close");
      connection.once("end", () => "connection end");
      connection.once("error", () => "connection error");
      handlePortForward(connection);
      handleSession(connection);
    });
}
