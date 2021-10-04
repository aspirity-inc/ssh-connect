type LoggerLevels = "INFO" | "WARN" | "ERRO";

class Logger {
  _log(level: LoggerLevels, args: unknown[], logFn = console.log) {
    const t = new Date().toLocaleTimeString();
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
