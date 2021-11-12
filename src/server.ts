import ssh, { Connection } from "ssh2";
import { getConnectionLogger, getRootLogger } from "./utils/logger";
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
    const logger = getConnectionLogger(client);
    logger.info("connected", info);
    handleConnection(client);
    connections.add(client);
    client.once("close", () => connections.delete(client));
    client.once("end", () => connections.delete(client));
  }
);

sshServer.listen({ port: config.port }, () => {
  getRootLogger().info(`ssh server listening`, sshServer.address());
});

function graceful(signal: string) {
  getRootLogger().info("Closing ssh server", { signal });
  sshServer.close(() => {
    getRootLogger().info("SSH server closed");
    process.exit(0);
  });
  [...connections].forEach((connection) => connection.end());
}

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);
