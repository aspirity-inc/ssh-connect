import { resolve as resolvePath } from "path";
import { writeFileSync, unlinkSync } from "fs";
import yaml from "yaml";
import { config } from "./config";

function getConfigFileName(domainPrefix: string, port: number) {
  return `${domainPrefix}.yaml`;
}

export function generateTraefikConfig(domainPrefix: string, port: number) {
  const key = `${domainPrefix}-${port}`;
  const domain = `${domainPrefix}.${config.appHost}`;
  const connectionConfig = {
    http: {
      services: {
        [key]: {
          loadBalancer: {
            servers: [{ url: `http://${config.serverHost}:${port}` }],
          },
        },
      },
      routers: {
        [key]: {
          service: key,
          rule: `Host(\`${domain}\`)`,
          entryPoints: config.traefikEntryPoints,
        },
      },
    },
  };
  const yamlConfig = yaml.stringify(connectionConfig);
  writeFileSync(
    resolvePath(
      config.traefikConfigsPath,
      getConfigFileName(domainPrefix, port)
    ),
    yamlConfig
  );

  return domain;
}

export function removeTraefikConfig(domainPrefix: string, port: number) {
  unlinkSync(
    resolvePath(
      config.traefikConfigsPath,
      getConfigFileName(domainPrefix, port)
    )
  );
}
