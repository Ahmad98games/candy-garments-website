const { createLogger, format, transports } = require('winston');

const { validateEnv } = require('../config/env');

const config = validateEnv();

const logger = createLogger({
  level: config.logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, stack, ...meta }) => {
          const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          const errorStack = stack ? `\n${stack}` : '';
          return `[${timestamp}] ${level}: ${message}${metaString}${errorStack}`;
        })
      )
    })
  ],
  exitOnError: false
});

module.exports = logger;

