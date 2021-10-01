import type { ServerChannel } from "ssh2";

declare module "ssh2" {
  interface ServerChannel {
    on(event: "data", listener: (chunk: Buffer) => void): this;
  }
}
