const isDevelopment = import.meta.env.DEV;
const enableLogging = import.meta.env.VITE_ENABLE_LOGGING === 'true';

class Logger {
  log(...args) {
    if (isDevelopment && enableLogging) {
      console.log(...args);
    }
  }

  error(...args) {
    if (isDevelopment && enableLogging) {
      console.error(...args);
    }
  }

  warn(...args) {
    if (isDevelopment && enableLogging) {
      console.warn(...args);
    }
  }

  info(...args) {
    if (isDevelopment && enableLogging) {
      console.info(...args);
    }
  }

  debug(...args) {
    if (isDevelopment && enableLogging) {
      console.debug(...args);
    }
  }

  table(...args) {
    if (isDevelopment && enableLogging) {
      console.table(...args);
    }
  }
}

export default new Logger();
