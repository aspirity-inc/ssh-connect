import ssh, { Connection } from "ssh2";
import { logger } from "./utils/logger";
import { loadKeys } from "./utils/load-keys";
import { handleConnection } from "./connection-handler";
import { config } from "./config";

const connections = new Set<Connection>();

const sshServer = new ssh.Server(
  {
    hostKeys: loadKeys(config.keysPath, config.passphrasesPath),
    ident: "ssh-connect 1.0.0",
  },
  (client, info) => {
    logger.info("connected", info);
    handleConnection(client);
    connections.add(client);
    client.on("close", () => connections.delete(client));
    client.on("end", () => connections.delete(client));
  }
);

sshServer.listen({ port: config.port }, () => {
  logger.info(`ssh server listening`, sshServer.address());
});

function graceful(signal: string) {
  logger.info("Closing ssh server", { signal });
  sshServer.close(() => {
    logger.info("SSH server closed");
    process.exit(0);
  });
  [...connections].forEach((connection) => connection.end());
}

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);
