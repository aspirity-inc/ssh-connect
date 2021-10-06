import { createServer as createTcpServer, Socket, AddressInfo } from "net";
import { Connection } from "ssh2";
import { generateTraefikConfig, removeTraefikConfig } from "./traefik-config";
import { getConnectionData } from "./utils/connection-data";
import { logger } from "./utils/logger";
import { Result } from "./utils/result";
import { socketsStorage } from "./utils/sockets-storage";

function forward(
  connection: Connection,
  socket: Socket,
  { address, port }: { address: string; port: number }
) {
  connection.forwardOut(
    address,
    port,
    socket.remoteAddress ?? "",
    socket.remotePort ?? 0,
    (err, stream) => {
      if (err) {
        logger.error("Cannot forward", { address, port }, err);
        socket.end();
        return;
      }
      stream.pipe(socket).pipe(stream);
    }
  );
}

export function handlePortForward(connection: Connection) {
  const connectionData = getConnectionData(connection);
  connection.on("request", async (accept, reject, name, info) => {
    if (name !== "tcpip-forward") {
      reject?.();
      return;
    }

    if (connectionData.forwardedPort.ok) {
      connectionData.clientLogger.sendMessage(
        "ERROR: only single port forward supported"
      );
      reject?.();
      return;
    }

    logger.info("client request", name, info);

    const tcpServer = createTcpServer((socket) => {
      const { port } = tcpServer.address() as AddressInfo;
      forward(connection, socket, { address: info.bindAddr, port });
    });

    tcpServer.listen({ port: info.bindPort, host: info.bindAddr }, () => {
      logger.info("TCP server listening", tcpServer.address());
      const { port } = tcpServer.address() as AddressInfo;
      accept?.(port);
      connectionData.forwardedPort = Result.ok({
        port,
        closeServer() {
          tcpServer.close();
          const sockets = [...socketsStorage.get(tcpServer)];
          sockets.forEach((socket) => socket.end());
        },
        getConnectionsCount() {
          return socketsStorage.get(tcpServer).size;
        },
      });
      const domain = generateTraefikConfig(connectionData.username!, port);
      connectionData.clientLogger.sendMessage(`You domain is ${domain}`);
    });

    tcpServer.on("connection", (socket: Socket) => {
      socketsStorage.get(tcpServer).add(socket);
      socket.once("close", () => {
        socketsStorage.get(tcpServer).delete(socket);
      });
    });

    tcpServer.once("close", () => {
      logger.info("TCP server closed");
      if (connectionData.forwardedPort.ok) {
        removeTraefikConfig(
          connectionData.username!,
          connectionData.forwardedPort.value.port
        );
      }
      connectionData.forwardedPort = Result.error(
        new Error("TCP server closed")
      );
    });

    connection.once("close", () => tcpServer.close());
    connection.once("end", () => tcpServer.close());
    connection.once("error", () => tcpServer.close());
  });
}
