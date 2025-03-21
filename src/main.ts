require('./instrument')
import { ModuleRef, NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import rawBody from 'fastify-raw-body'
import 'reflect-metadata'
import { AppModule } from './app.module'
import { logger } from './helpers/application.helper'
import { DataLoaderInterceptor } from './infrastructure/dataloader/dataloader.interceptor'
import { ExceptionInterceptor } from './infrastructure/interceptors/exception.interceptor'
import { TypeormErrorFilter } from './infrastructure/interceptors/typeorm-error.filter'
import { AppLogger } from './infrastructure/logger/logger'
import { GraphqlValidationPipe } from './libs/pipes/graphql-validation.pipe'
import moment = require('moment')
const processRequest = require('graphql-upload/processRequest.js')
const Sentry = require('@sentry/node')

const port = Number(process.env.PORT) || 5001

async function bootstrap(): Promise<void> {
  const adapter = new FastifyAdapter({
    logger: true,
    disableRequestLogging: true,
  })
  const fastify = adapter.getInstance()
  fastify.addHook('onRoute', (opts) => {
    if (opts.path === '/payment-service-webhooks') {
      opts.config = { rawBody: true }
    }
  })
  fastify.addContentTypeParser(
    'multipart',
    (request: any, payload: any, done: any) => {
      request.isMultipart = true
      done()
    },
  )
  fastify.addHook('preValidation', async function (request: any, reply) {
    if (!request.isMultipart) {
      return
    }

    request.body = await processRequest(request.raw, reply.raw)
  })

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    {
      logger: ['error', 'warn', 'debug', 'verbose'],
    },
  )

  //https://www.npmjs.com/package/fastify-raw-body
  await app.register(rawBody as any, {
    field: 'rawBody',
    global: false,
    encoding: false,
    runFirst: true,
    jsonContentTypes: [],
  })

  //await app.register(helmet);
  app.enableCors()

  moment.locale('fr')
  logger.log('initialization: App created')
  app.useLogger(app.get<AppLogger>(AppLogger))

  app.useGlobalPipes(new GraphqlValidationPipe())

  // filters
  app.useGlobalFilters(new TypeormErrorFilter())

  // interceptors
  const moduleRef = app.get<ModuleRef>(ModuleRef)
  app.useGlobalInterceptors(
    new DataLoaderInterceptor(moduleRef),
    new ExceptionInterceptor(),
  )

  app.enableShutdownHooks()

  logger.info(`initialization: starting server on port ${port}`)

  await app.listen({
    port,
    host: '0.0.0.0',
  })
  logger.info('server ready')
}
bootstrap()
