import { createServer as createTcpServer } from "net";
import { Connection } from "ssh2";
import { storage } from "./utils/data-storage";
import { logger } from "./utils/logger";

export function handleConnection(connection: Connection) {
  connection
    .on("authentication", (authCtx) => {
      logger.info("client authentication", {
        username: authCtx.username,
        service: authCtx.service,
        method: authCtx.method,
      });
      switch (authCtx.method) {
        case "none":
          storage.set(connection, { username: authCtx.username });
          authCtx.accept();
          break;
        default:
          authCtx.reject();
          break;
      }
    })
    .on("ready", (...args) => {
      logger.info("client ready", ...args);
    })
    .on("session", (accept, reject) => {
      logger.info("client session");
      const session = accept()
        .on("pty", (accept) => accept?.())
        .on("close", () => {
          logger.info("session closed");
        });

      session.on("shell", (accept) => {
        const stream = accept();
        stream.write("LOL > ");
        stream.on("data", (data) => {
          if (data.length === 1 && data[0] === 0x03) {
            stream.end("\r\nClosing...\r\n");
          }
        });
      });
    })
    .on("request", (accept, reject, name, info) => {
      logger.info("client request", name, info);

      if (name !== "tcpip-forward" && name !== "cancel-tcpip-forward") {
        reject?.();
        return;
      }
      accept?.();
      const tcpServer = createTcpServer((socket) => {
        connection.forwardOut(
          info.bindAddr,
          info.bindPort,
          socket.remoteAddress ?? "",
          socket.remotePort ?? 0,
          (err, stream) => {
            if (err) {
              logger.info("[SSH]", err);
              return socket.end();
            }
            stream.pipe(socket).pipe(stream);
          }
        );
      });
      tcpServer.listen({ port: info.bindPort, host: info.bindAddr });
      connection.on("end", () => {
        logger.info("Closing TCP server");
        tcpServer.close();
      });
    });
}
