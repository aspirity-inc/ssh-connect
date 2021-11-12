import { nanoid } from "nanoid";
import { Connection } from "ssh2";
import { WeakStorage } from "./weak-storage";

type LoggerLevels = "INFO" | "WARN" | "ERR_";

class Logger {
  _labels: string[];

  constructor(labels: string[] = []) {
    this._labels = labels;
  }

  _log(level: LoggerLevels, args: unknown[], logFn = console.log) {
    const d = new Date();
    const h = d.getHours().toString(10).padStart(2, "0");
    const m = d.getMinutes().toString(10).padStart(2, "0");
    const s = d.getSeconds().toString(10).padStart(2, "0");
    const t = `${h}:${m}:${s}`;
    logFn(...this._labels, `[${level}]`, t, ...args);
  }

  info(...args: unknown[]) {
    this._log("INFO", args);
  }
  warn(...args: unknown[]) {
    this._log("WARN", args);
  }
  error(...args: unknown[]) {
    this._log("ERR_", args, console.error);
  }
}

export const connectionLoggers = new WeakStorage<Connection, Logger>(
  () => new Logger([nanoid(8)])
);

export function getConnectionLogger(connection: Connection): Logger {
  return connectionLoggers.get(connection);
}

const rootLogger = new Logger();
export function getRootLogger(): Logger {
  return rootLogger;
}
