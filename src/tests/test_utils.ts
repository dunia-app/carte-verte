import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { ModuleMetadata } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { GraphQLModule } from '@nestjs/graphql'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ScheduleModule } from '@nestjs/schedule'
import { Test } from '@nestjs/testing'
import { join } from 'path'
import { BankAccountManagerModule } from '../infrastructure/bank-account-manager/bank-account-manager.module'
import { CardAcquisitionServiceModule } from '../infrastructure/card-acquisition-service/card-acquisition-service.module'
import { ConfigModule } from '../infrastructure/config/config.module'
import { buildTypOrmModule } from '../infrastructure/database/build_database'
import { UnitOfWorkModule } from '../infrastructure/database/unit-of-work/unit-of-work.module'
import { DataLoaderInterceptor } from '../infrastructure/dataloader/dataloader.interceptor'
import { AppLoggerModule } from '../infrastructure/logger/logger.module'
import { RedisModule } from '../infrastructure/redis/redis.module'
import { TWithStringKeys } from '../libs/types/t-with-keys'
import { AuthModule } from '../modules/auth/auth.module'

export async function createTestModule(
  meta: ModuleMetadata,
  services = {} as TWithStringKeys,
  overrideAuthProviders = true,
) {
  const { imports, ...rest } = meta

  let module = Test.createTestingModule({
    imports: [
      buildTypOrmModule({ logging: !!process.env.DEBUG }),
      GraphQLModule.forRoot<ApolloDriverConfig>({
        buildSchemaOptions: {
          dateScalarMode: 'isoDate',
          nullableByDefault: true,
          validate: false,
        } as any,
        driver: ApolloDriver,
        autoSchemaFile: join(process.cwd(), 'schema.gql'),
        context: (args: any) => {
          return { req: args.request, res: args.reply }
        },
      }),
      ConfigModule,
      RedisModule,
      AppLoggerModule,
      AuthModule,
      UnitOfWorkModule,
      BankAccountManagerModule,
      CardAcquisitionServiceModule,
      ScheduleModule.forRoot(),
      ...(imports || []),
    ],
    providers: [
      {
        provide: APP_INTERCEPTOR,
        useClass: DataLoaderInterceptor,
      },
    ],
    ...(rest || {}),
  })
  const compiledModule = await module.compile()

  for (const key in services) {
    const value = services[key]
    services[key] = compiledModule.get<typeof value>(value)
  }
  return compiledModule.createNestApplication<NestFastifyApplication>(new FastifyAdapter())
}

export function buildTypedServices<T>(services: {
  [key in keyof T]: { new (...args: any[]): T[key] }
}) {
  const s = services as any as {
    [key in keyof T]: T[key]
  }
  return s
}