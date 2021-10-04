import { Connection } from "ssh2";
import { ConnectedClientLogger } from "./utils/client-logger";
import { getConnectionData } from "./utils/connection-data";
import { logger } from "./utils/logger";

export function handleSession(connection: Connection) {
  const connectionData = getConnectionData(connection);
  connection.on("session", (accept, reject) => {
    logger.info("client session");
    accept()
      .on("pty", (accept) => accept?.())
      .on("close", () => logger.info("session closed"))
      .on("shell", (accept) => {
        const stream = accept();
        const lineBreak = (s = "") => stream.write(`${s}\r\n`);

        const clientLogger = new ConnectedClientLogger(stream);
        clientLogger.resend(connectionData.clientLogger);
        connectionData.clientLogger = clientLogger;
        stream.on("data", (data) => {
          if (data.length === 1 && data[0] === 0x03) {
            lineBreak("================");
            if (connectionData.forwardedPort.ok) {
              const { closeServer, getConnectionsCount } =
                connectionData.forwardedPort.value;
              const count = getConnectionsCount();
              if (count > 0) {
                lineBreak(`Opened connections: ${getConnectionsCount()}`);
              }
              closeServer();
            }
            lineBreak("Closing...");
            stream.end();
          }
        });
      });
  });
}
