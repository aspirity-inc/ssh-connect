import { createServer as createTcpServer, Socket } from "net";
import { Connection, TcpipBindInfo } from "ssh2";
import { logger } from "./utils/logger";

function forward(
  connection: Connection,
  socket: Socket,
  { bindAddr, bindPort }: TcpipBindInfo
) {
  connection.forwardOut(
    bindAddr,
    bindPort,
    socket.remoteAddress ?? "",
    socket.remotePort ?? 0,
    (err, stream) => {
      if (err) {
        logger.error(`Cannot forward ${bindAddr}:${bindPort}`, err);
        socket.end();
        return;
      }
      stream.pipe(socket).pipe(stream);
    }
  );
}

export function handlePortForward(connection: Connection) {
  connection.on("request", async (accept, reject, name, info) => {
    if (name !== "tcpip-forward" && name !== "cancel-tcpip-forward") {
      reject?.();
      return;
    }
    accept?.();

    const tcpServer = createTcpServer((socket) =>
      forward(connection, socket, info)
    );
  });
}
