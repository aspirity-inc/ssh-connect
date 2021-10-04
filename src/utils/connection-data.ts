import { Connection } from "ssh2";
import { ClientLogger, DisconnectedClientLogger } from "./client-logger";
import { Result } from "./result";
import { WeakStorage } from "./weak-storage";

interface ForwardedPort {
  port: number;
  closeServer(): void;
  getConnectionsCount(): number;
}

export interface ConnectionData {
  username?: string;
  forwardedPort: Result<ForwardedPort, Error>;
  clientLogger: ClientLogger;
}

const storage = new WeakStorage<Connection, ConnectionData>(() => ({
  forwardedPort: Result.error(new Error("No port forwarded")),
  clientLogger: new DisconnectedClientLogger(),
}));

export function getConnectionData(connection: Connection): ConnectionData {
  return new Proxy({} as ConnectionData, {
    get(_, property) {
      const data = storage.get(connection);
      return data[property as keyof ConnectionData];
    },
    set(_, property, value) {
      const data = { [property as keyof ConnectionData]: value };
      storage.set(connection, data);
      return true;
    },
  });
}
