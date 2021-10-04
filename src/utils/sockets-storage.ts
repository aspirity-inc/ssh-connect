import { Server, Socket } from "net";
import { WeakStorage } from "./weak-storage";

export const socketsStorage = new WeakStorage<Server, Set<Socket>>(
  () => new Set()
);
