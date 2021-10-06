type LoggerLevels = "INFO" | "WARN" | "ERRO";

class Logger {
  _log(level: LoggerLevels, args: unknown[], logFn = console.log) {
    const d = new Date();
    const h = d.getHours().toString(10).padStart(2, "0");
    const m = d.getMinutes().toString(10).padStart(2, "0");
    const s = d.getSeconds().toString(10).padStart(2, "0");
    const t = `${h}:${m}:${s}`;
    logFn(`[${level}]`, t, ...args);
  }

  info(...args: unknown[]) {
    this._log("INFO", args);
  }
  warn(...args: unknown[]) {
    this._log("WARN", args);
  }
  error(...args: unknown[]) {
    this._log("ERRO", args, console.error);
  }
}

export const logger = new Logger();
