import { Connection } from "ssh2";

export type ConnectionData = {
  username: string | null;
};

const defaultData = Object.freeze<ConnectionData>({
  username: null,
});

class DataStorage {
  _map = new WeakMap<Connection, Readonly<ConnectionData>>();

  get(connection: Connection): Readonly<ConnectionData> {
    return this._map.get(connection) ?? defaultData;
  }

  set(connection: Connection, data: Partial<ConnectionData>) {
    const processedData = Object.freeze({
      ...this.get(connection),
      ...data,
    });
    this._map.set(connection, processedData);
  }
}

export const storage = new DataStorage();
