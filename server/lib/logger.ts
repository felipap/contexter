type LogFn = (...args: unknown[]) => void

type Logger = {
  log: LogFn
  warn: LogFn
  error: LogFn
}

export function createLogger(prefix: string): Logger {
  const tag = `[${prefix}]`
  return {
    log: (...args: unknown[]) => console.log(tag, ...args),
    warn: (...args: unknown[]) => console.warn(tag, ...args),
    error: (...args: unknown[]) => console.error(tag, ...args),
  }
}
