import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Inject, Module, OnModuleInit, UseGuards } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { GraphQLModule } from '@nestjs/graphql'
import { FastifyInstance } from 'fastify'
import {
  GraphQLError,
  GraphQLErrorExtensions,
  GraphQLFormattedError,
} from 'graphql'
import { Maybe } from 'graphql/jsutils/Maybe'
import _ from 'lodash'
import { join } from 'path'
import { isProductionEnv } from '../../helpers/is_env'
import { loggerLocalStorage } from '../../libs/ddd/infrastructure/logger/logger.service'
import { DateScalar } from '../../libs/types/date-without-time.scalar'
import { BasicAuthGuard } from '../guards/basic.guard'
import { AppLogger } from '../logger/logger'
const Sentry = require('@sentry/node')

const debugGql = !!(!isProductionEnv || process.env.WITH_GQL_DEBUG)

interface ErrorExtensionException {
  status: number
  message: string
  code: string
}

interface OriginalError extends Error {
  response: {
    message: string
    statusCode: string
  }
}

export function buildGraphqlModule() {
  const logger = new AppLogger('GraphQL Module')
  return GraphQLModule.forRoot<ApolloDriverConfig>({
    autoSchemaFile: join(process.cwd(), 'schema.gql'),
    driver: ApolloDriver,
    playground: debugGql,
    introspection: debugGql,
    formatError: (formattedError: GraphQLFormattedError, error: unknown) => {
      const errorSimple: Maybe<GraphQLErrorExtensions> | undefined = _.get(
        formattedError,
        'extensions.exception.response',
      )

      const pathStr = formattedError.path
        ? formattedError.path.join(' => ')
        : ''
      logger.setContext(`GraphQL - ${pathStr}`)

      const graphQLError = error as GraphQLError
      const originalError = graphQLError.originalError as OriginalError
      const statusCode = originalError?.response?.statusCode
        ? originalError?.response?.statusCode
        : 500

      if (errorSimple) {
        const extensions = formattedError.extensions

        if (extensions) {
          const exception = formattedError.extensions
            .exception as ErrorExtensionException
          logger.error(`${exception.status} ${exception.message}`, null)
        }

        const logExtensions = {
          ...extensions,
          source: graphQLError.source,
          positions: graphQLError.positions,
          path: graphQLError.path,
          originalError: graphQLError.originalError,
          response: {
            statusCode: statusCode,
          },
        }

        logger.debug(JSON.stringify(logExtensions))

        return {
          message: formattedError.message,
          locations: formattedError.locations,
          extensions: {
            response: {
              statusCode: statusCode,
            },
          },
        }
      } else {
        logger.error(`INTERNAL_SERVER_ERROR`, error)
        if (!debugGql) {
          return {
            message: 'INTERNAL_SERVER_ERROR',
            extensions: {
              code: graphQLError.extensions?.code,
            },
          }
        }
        return {
          ...formattedError,
          extensions: {
            response: {
              statusCode: statusCode,
            },
          },
        }
      }
    },
    // important to have access to http context with req/res
    context: (args: any) => {
      return { req: args.request, res: args.reply }
    },
  })
}

@Module({
  imports: [buildGraphqlModule()],
  providers: [DateScalar],
})
@UseGuards(BasicAuthGuard)
export class AppGraphqlModule implements OnModuleInit {
  constructor(
    @Inject(HttpAdapterHost) private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  async onModuleInit() {
    const httpAdapter = this.httpAdapterHost.httpAdapter

    const instance: FastifyInstance = httpAdapter.getInstance()

    // onRequest hook is using another context
    // preValidation uses the correct context
    instance.addHook('preValidation', (req, res, done) => {
      loggerLocalStorage.run(
        {
          contextId: req.id,
        },
        done,
      )
    })
  }
}
