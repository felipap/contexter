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

export function truncateForLog(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) {
    return obj
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key === "dataBase64" && typeof value === "string") {
      result[key] = `[base64 ${value.length} chars]`
    } else if (key === "attachments" && Array.isArray(value)) {
      result[key] = value.map((att) => truncateForLog(att))
    } else {
      result[key] = value
    }
  }
  return result
}
