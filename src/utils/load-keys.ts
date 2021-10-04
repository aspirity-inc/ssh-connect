import { readdirSync, readFileSync } from "fs";
import { resolve as resolvePath } from "path";
import type { ServerConfig } from "ssh2";

function getFilenames(dirPath: string) {
  return readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

export function loadKeys(
  keysDirPath: string,
  passphrasesDirPath: string
): ServerConfig["hostKeys"] {
  const keyNames = readdirSync(keysDirPath, { withFileTypes: true });
  const passphrasesName = new Set(getFilenames(passphrasesDirPath));

  return keyNames
    .filter((entry) => entry.isFile())
    .map(({ name: keyName }) => {
      const key = readFileSync(resolvePath(keysDirPath, keyName));
      if (!passphrasesName.has(keyName)) {
        return key;
      }
      return {
        key,
        passphrase: readFileSync(
          resolvePath(passphrasesDirPath, keyName)
        ).toString("utf8"),
      };
    });
}
