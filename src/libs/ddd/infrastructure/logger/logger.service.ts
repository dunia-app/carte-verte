import { ConsoleLogger } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { join } from 'path'
import { TransportStreamOptions } from 'winston-transport'
import { isProductionEnv } from '../../../../helpers/is_env'
import winston = require('winston')
import TransportStream = require('winston-transport')


type LoggingContextStore = {
  contextId: string
  userId?: string
}
export const loggerLocalStorage = new AsyncLocalStorage<LoggingContextStore>()

const { combine, timestamp, errors, align, padLevels, json, simple } =
  winston.format

class NestJsLogTransport extends TransportStream {
  constructor(opts?: TransportStreamOptions) {
    super(opts)
  }

  log(args: any, next: () => void) {
    const { message, level, context, trace } = args
    let loggerMethod: 'error' | 'warn' | 'debug' | 'log'
    switch (level) {
      case 'fatal':
      case 'error':
        loggerMethod = 'error'
        break
      case 'debug':
        loggerMethod = 'debug'
        break
      case 'warn':
        loggerMethod = 'warn'
        break
      default:
        loggerMethod = 'log'
        break
    }
    // Ask Nadem why this and why is it not working
    // setTimeout(() => {
    //   if (loggerMethod === 'error') {
    //     Logger.error(
    //       message?.message || message,
    //       JSON.stringify(trace || {}, null, 2),
    //       context,
    //     )
    //   } else {
    //     Logger[loggerMethod](
    //       typeof message === 'object'
    //         ? JSON.stringify(message, null, 2)
    //         : message,
    //       context,
    //     )
    //   }
    // }, 0)
    next()
  }
}

const myCustomLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    fatal: 'red',
    error: 'orange',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
  },
}
export class AppLoggerService extends ConsoleLogger {
  winstonErrorLogger: winston.Logger & {
    fatal: winston.Logger['error']
  }

  winstonInfoLogger: winston.Logger
  winstonCombinedLogger: winston.Logger
  protected context = ''
  child = function () {
    return new AppLoggerService()
  }

  constructor(context?: string) {
    super()

    this.context = context ? context : this.context
    const isInDist = /\/dist\//.test(__dirname)
    let logFolderPath
    if (isInDist) {
      logFolderPath = join(__dirname, '../../../../../../log')
    } else {
      logFolderPath = join(__dirname, '../../../../../log')
    }

    const MB = 1000000
    const logRotationOptions: winston.transports.FileTransportOptions = {
      maxsize: 3 * MB,
      maxFiles: 20,
      tailable: true,
      zippedArchive: true,
    }

    const formatTimestamp = () =>
      timestamp({ format: 'DD-MM-YYYY HH:mm:ss SSS[ms]' })
    const configJson = () => json({ space: 1 })

    winston.addColors(myCustomLevels.colors)
    this.winstonErrorLogger = winston.createLogger({
      level: isProductionEnv ? 'info' : 'debug',
      levels: myCustomLevels.levels,
      format: formatTimestamp(),
      transports: [
        new NestJsLogTransport(),
        new winston.transports.File({
          level: 'fatal',
          filename: join(logFolderPath, 'fatal.log'),
          format: combine(errors({ stack: true }), configJson()),
          ...logRotationOptions,
        }),
        new winston.transports.File({
          level: 'error',
          filename: join(logFolderPath, 'error.log'),
          format: combine(errors({ stack: true }), configJson()),
          ...logRotationOptions,
        }),
        new winston.transports.File({
          level: 'warn',
          filename: join(logFolderPath, 'warn.log'),
          format: combine(timestamp(), configJson()),
          ...logRotationOptions,
        }),
      ],
    }) as any
    this.winstonInfoLogger = winston.createLogger({
      level: isProductionEnv ? 'info' : 'debug',
      levels: myCustomLevels.levels,
      format: formatTimestamp(),
      transports: [
        new NestJsLogTransport(),
        new winston.transports.File({
          level: 'info',
          filename: join(logFolderPath, 'info.log'),
          format: combine(simple(), align()),
          ...logRotationOptions,
        }),
      ],
    })
    this.winstonCombinedLogger = winston.createLogger({
      level: isProductionEnv ? 'info' : 'debug',
      levels: myCustomLevels.levels,
      format: formatTimestamp(),
      transports: [
        new winston.transports.File({
          filename: join(logFolderPath, 'combined.log'),
          format: combine(simple(), align()),
          ...logRotationOptions,
          maxsize: logRotationOptions.maxsize
            ? logRotationOptions.maxsize * 4
            : 4,
        }),
        new winston.transports.File({
          level: 'error',
          filename: join(logFolderPath, 'combined.log'),
          format: combine(errors({ stack: true }), configJson()),
          ...logRotationOptions,
          maxsize: logRotationOptions.maxsize
            ? logRotationOptions.maxsize * 4
            : 4,
        }),
        new winston.transports.Console({
          format: combine(simple(), align()),
        }),
        new winston.transports.Console({
          level: 'error',
          format: combine(errors({ stack: true }), simple(), align()),
        }),
      ],
    })
  }
  error(message: any, trace?: any) {
    this.logMessage(this.winstonErrorLogger.error, message, {
      context: this.context,
      trace,
    })
  }
  fatal(message: any, trace?: any) {
    this.error(message, trace)
  }
  log(message: any) {
    this.logMessage(
      this.winstonInfoLogger.info,
      typeof message === 'object' ? JSON.stringify(message, null, 1) : message,
      {
        context: this.context,
      },
    )
  }
  info(message: any) {
    this.log(message)
  }
  warn(message: any) {
    this.logMessage(this.winstonErrorLogger.warn, message, {
      context: this.context,
    })
  }
  trace(message: any) {
    this.warn(message)
  }
  debug(message: any) {
    this.logMessage(this.winstonInfoLogger.debug, message, {
      context: this.context,
    })
  }
  exception(message: any, trace?: any) {
    this.logMessage(this.winstonErrorLogger.fatal, message, {
      context: this.context,
      trace,
    })
  }

  private logMessage(
    logger: winston.LeveledLogMethod,
    message: string,
    contextInfo: { context?: string; trace?: any } = {
      context: '',
      trace: undefined,
    },
  ) {
    const store = loggerLocalStorage.getStore()

    let prefixContext = ''
    if (store) {
      prefixContext = `req[${store.contextId}]`
      if (store.userId) {
        prefixContext += ` user[${store.userId}]`
      }
    }
    contextInfo.context = `${prefixContext} ${contextInfo.context || ''}`
    logger(message, contextInfo)
    const combinedLogger = !!contextInfo.trace
      ? this.winstonCombinedLogger.error
      : this.winstonCombinedLogger.info
    combinedLogger(message, contextInfo)
  }

  setContext(context: string): void {
    this.context = context
  }
}
