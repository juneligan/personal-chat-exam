// src/utils/logger.ts
enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    LOG = 2,
    WARN = 3,
    ERROR = 4,
    NONE = 5
}

// Set minimum level based on environment
const currentLevel = process.env.NODE_ENV === 'production'
    ? LogLevel.ERROR  // Only show errors in production
    : LogLevel.DEBUG; // Show all in development

export const logger = {
    debug: (...args: any[]) => {
        if (currentLevel <= LogLevel.DEBUG) console.debug('[DEBUG]', ...args);
    },
    info: (...args: any[]) => {
        if (currentLevel <= LogLevel.INFO) console.info('[INFO]', ...args);
    },
    log: (...args: any[]) => {
        if (currentLevel <= LogLevel.LOG) console.log('[LOG]', ...args);
    },
    warn: (...args: any[]) => {
        if (currentLevel <= LogLevel.WARN) console.warn('[WARN]', ...args);
    },
    error: (...args: any[]) => {
        if (currentLevel <= LogLevel.ERROR) console.error('[ERROR]', ...args);
    }
};