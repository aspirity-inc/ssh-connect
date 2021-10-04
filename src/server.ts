import { resolve as resolvePath } from "path";
import ssh from "ssh2";
import { logger } from "./utils/logger";
import { loadKeys } from "./utils/load-keys";
import { handleConnection } from "./connection-handler";

const sshServer = new ssh.Server(
  {
    hostKeys: loadKeys(resolvePath("keys"), resolvePath("passphrases")),
    ident: "ssh-connect 1.0.0",
  },
  (client, info) => {
    logger.info("connected", info);
    handleConnection(client);
  }
);

sshServer.listen({ port: 42222 }, () => {
  logger.info(`ssh server listening`, sshServer.address());
});
