/* eslint-disable no-console */

const REDACTED = '[REDACTED]';

/**
 * Property names whose values may contain credentials. Checked case-insensitively
 * against object keys before logging.
 */
export const SENSITIVE_KEY_PATTERN =
  /(authorization|bearer|api[-_]?key|apikey|\bkey\b|access[-_]?token|refresh[-_]?token|id[-_]?token|secret|password|passwd|credential|cookie|jwt)/i;

/**
 * Scrubs credential-shaped values out of a string (URLs, error messages, serialized objects).
 */
export const scrubSecrets = (value: string): string =>
  value
    .replace(/Bearer\s+\S+/gi, `Bearer ${REDACTED}`)
    .replace(/\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{8,}/g, REDACTED)
    .replace(/\bAIza[A-Za-z0-9_-]{10,}/g, REDACTED)
    .replace(/([?&](?:key|api_key|apikey|access_token|token)=)[^\s&"']+/gi, `$1${REDACTED}`);

const MAX_SANITIZE_DEPTH = 5;

// Only redact string/object values — booleans and numbers under names like
// "hasApiKey" or "keyLength" are useful debugging info, not secrets
const isSensitiveEntry = (key: string, value: unknown): boolean =>
  SENSITIVE_KEY_PATTERN.test(key) && (typeof value === 'string' || (typeof value === 'object' && value !== null));

/**
 * Deep-sanitizes a value before it reaches the console so API keys and other
 * credentials can never appear in log output — even inside nested axios configs
 * or expanded error objects.
 */
export const sanitizeForLog = (value: unknown, depth = 0, seen: WeakSet<object> = new WeakSet()): unknown => {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return scrubSecrets(value);
  if (typeof value !== 'object') return value;
  if (depth >= MAX_SANITIZE_DEPTH) return '[Max depth reached]';
  if (seen.has(value)) return '[Circular]';
  seen.add(value);

  if (value instanceof Error) {
    const err = value as Error & Record<string, any>;
    const safe: Record<string, unknown> = {
      name: err.name,
      message: scrubSecrets(err.message),
      stack: err.stack ? scrubSecrets(err.stack) : undefined,
    };
    for (const key of Object.keys(err)) {
      if (key === 'name' || key === 'message' || key === 'stack') continue;
      safe[key] = isSensitiveEntry(key, err[key]) ? REDACTED : sanitizeForLog(err[key], depth + 1, seen);
    }
    return safe;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 100).map(item => sanitizeForLog(item, depth + 1, seen));
  }

  const sanitized: Record<string, unknown> = {};
  for (const key of Object.keys(value)) {
    try {
      const prop = (value as Record<string, any>)[key];
      sanitized[key] = isSensitiveEntry(key, prop) ? REDACTED : sanitizeForLog(prop, depth + 1, seen);
    } catch {
      sanitized[key] = '[Unserializable]';
    }
  }
  return sanitized;
};

// Store the original console methods
const originalConsole = {
  debug: console.debug,
  info: console.info,
  warn: console.warn,
  error: console.error,
  log: console.log,
};

// Simple logger implementation that won't cause infinite loops
const createSimpleLogger = () => {
  const log = (level: 'debug' | 'info' | 'warn' | 'error', msg: string, obj?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${level.toUpperCase()}] ${timestamp}: ${scrubSecrets(msg)}`;
    const safeObj = obj === undefined ? undefined : sanitizeForLog(obj);
    const method = level === 'debug' ? 'log' : level;

    if (safeObj === undefined) {
      originalConsole[method](logMessage);
    } else if (typeof safeObj === 'object') {
      originalConsole[method](logMessage, JSON.stringify(safeObj, null, 2));
    } else {
      originalConsole[method](`${logMessage} - ${String(safeObj)}`);
    }
  };

  return {
    debug: (msg: string, obj?: any) => log('debug', msg, obj),
    info: (msg: string, obj?: any) => log('info', msg, obj),
    warn: (msg: string, obj?: any) => log('warn', msg, obj),
    error: (msg: string, obj?: any) => log('error', msg, obj),
    fatal: (msg: string, obj?: any) => log('error', `FATAL: ${msg}`, obj),
  };
};

// Export the logger instance
export const logger = createSimpleLogger();

// Helper to normalize error objects
const normalizeError = (error: unknown): Error | Record<string, unknown> => {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'object' && error !== null) {
    return error as Record<string, unknown>;
  }
  return { message: String(error) };
};

// Convenience methods for common log levels
export const logDebug = (msg: string, obj?: unknown) => {
  if (obj === undefined) {
    logger.debug(msg);
  } else {
    const normalized = normalizeError(obj);
    logger.debug(msg, normalized);
  }
};

export const logInfo = (msg: string, obj?: unknown) => {
  if (obj === undefined) {
    logger.info(msg);
  } else {
    const normalized = normalizeError(obj);
    logger.info(msg, normalized);
  }
};

export const logWarn = (msg: string, obj?: unknown) => {
  if (obj === undefined) {
    logger.warn(msg);
  } else {
    const normalized = normalizeError(obj);
    logger.warn(msg, normalized);
  }
};

export const logError = (msg: string, obj?: unknown, errorInfo?: unknown) => {
  if (obj === undefined) {
    logger.error(msg);
  } else {
    const normalized = normalizeError(obj);
    logger.error(msg, normalized);
  }
};
