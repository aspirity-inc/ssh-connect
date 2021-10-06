import { resolve as resolvePath } from "path";

export const config = {
  keysPath: process.env.KEYS_PATH ?? resolvePath("keys"),
  passphrasesPath: process.env.PASSPHRASES_PATH ?? resolvePath("passphrases"),
  traefikConfigsPath: resolvePath("traefik-configs"),
  appHost: process.env.PUBLIC_HOST ?? "ssh.localhost",
  port: 42222,
  serverHost: process.env.SERVER_HOST ?? "host.docker.internal",
};
