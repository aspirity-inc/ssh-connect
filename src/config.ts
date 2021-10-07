import { resolve as resolvePath } from "path";
import { readFileSync } from "fs";

function getPassword(): string | undefined {
  if (process.env.CONNECTION_PASSWORD) {
    return process.env.CONNECTION_PASSWORD;
  }
  if (process.env.CONNECTION_PASSWORD_FILE) {
    const password = readFileSync(
      process.env.CONNECTION_PASSWORD_FILE,
      "utf-8"
    );
    return password;
  }
  return undefined;
}

export const config = {
  keysPath: process.env.KEYS_PATH ?? resolvePath("keys"),
  passphrasesPath: process.env.PASSPHRASES_PATH ?? resolvePath("passphrases"),
  traefikConfigsPath: resolvePath("traefik-configs"),
  appHost: process.env.PUBLIC_HOST ?? "ssh.localhost",
  port: 42222,
  serverHost: process.env.SERVER_HOST ?? "host.docker.internal",
  traefikEntryPoints: process.env.TRAEFIK_ENTRY_POINTS?.split(","),
  password: getPassword(),
};
