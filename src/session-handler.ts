import { Connection } from "ssh2";
import { ConnectedClientLogger } from "./utils/client-logger";
import { getConnectionData } from "./utils/connection-data";
import { getConnectionLogger } from "./utils/logger";

export function handleSession(connection: Connection) {
  const connectionData = getConnectionData(connection);
  connection.on("session", (accept, reject) => {
    getConnectionLogger(connection).info("client session");
    accept()
      .on("pty", (accept) => accept?.())
      .on("close", () => getConnectionLogger(connection).info("session closed"))
      .on("shell", (accept) => {
        const stream = accept();

        const clientLogger = new ConnectedClientLogger(stream);
        clientLogger.resend(connectionData.clientLogger);
        connectionData.clientLogger = clientLogger;

        if (!connectionData.forwardedPort.ok) {
          setTimeout(() => {
            if (connectionData.forwardedPort.ok) return;
            clientLogger.sendMessage(
              `⛔️ ${connectionData.forwardedPort.error.message}`
            );
            clientLogger.sendMessage("⛔️ Use Remote Port Forwarding");
            clientLogger.sendMessage("⛔️ ssh -R 0:<host>:<port> ...");
            clientLogger.sendMessage(
              "⛔️ See details https://www.ssh.com/academy/ssh/tunneling/example#remote-forwarding"
            );
            stream.end();
          }, 1000);
        }

        stream.on("data", (data) => {
          if (data.length === 1 && data[0] === 0x03) {
            clientLogger.sendMessage("================");
            if (connectionData.forwardedPort.ok) {
              const { closeServer, getConnectionsCount } =
                connectionData.forwardedPort.value;
              const count = getConnectionsCount();
              if (count > 0) {
                clientLogger.sendMessage(
                  `Opened connections: ${getConnectionsCount()}`
                );
              }
              closeServer();
            }
            clientLogger.sendMessage("Closing...");
            stream.end();
          }
        });
      });
  });
}
