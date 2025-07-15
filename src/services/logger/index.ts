/* eslint-disable no-console */

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
    const logMessage = `[${level.toUpperCase()}] ${timestamp}: ${msg}`;

    if (obj === undefined) {
      originalConsole[level === 'debug' ? 'log' : level](logMessage);
    } else if (obj instanceof Error) {
      originalConsole[level === 'debug' ? 'log' : level](logMessage, obj);
    } else if (typeof obj === 'object') {
      originalConsole[level === 'debug' ? 'log' : level](logMessage, JSON.stringify(obj, null, 2));
    } else {
      originalConsole[level === 'debug' ? 'log' : level](`${logMessage} - ${String(obj)}`);
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
