import { TypeOrmModule } from '@nestjs/typeorm'
import { join } from 'path'

import { DynamicModule } from '@nestjs/common'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { isProductionEnv } from '../../helpers/is_env'
import { ConfigModule } from '../config/config.module'
import { ConfigService } from '../config/config.service'
import { AppLoggerModule } from '../logger/logger.module'

export function logCreds(config: ConfigService) {
  console.log('host: ', config.get('DB_HOST'))
  console.log('port: ', config.get('DB_PORT'))
  console.log('username: ', config.get('DB_USERNAME'))
  console.log('password: ', config.get('DB_PASSWORD'))
  console.log('database: ', config.get('DB_DATABASE_NAME'))
}
export function buildTypOrmModule(
  overrideOpt = {} as Partial<PostgresConnectionOptions>,
) {
  try {
    return TypeOrmModule.forRootAsync({
      imports: [ConfigModule, AppLoggerModule],
      useFactory: async (config: ConfigService) => {
        const isTest = process.env.NODE_ENV === 'test'
        let opt = {}
        const enableCache =
          false && (isProductionEnv || process.env.CACHE_ENABLED)
        if (!isTest) {
          opt = {
            cli: {
              migrationsDir: 'migration',
            },
            cache: enableCache && {
              type: 'ioredis' as any,
              alwaysEnabled: true,
              duration: 250,
              options: {
                host: config.get('REDIS_HOST'),
                port: Number(config.get('REDIS_PORT')),
              },
            },
          }
        }
        const res: PostgresConnectionOptions = {
          type: 'postgres' as any,
          host: config.get('DB_HOST'),
          port: Number(config.get('DB_PORT')),
          username: config.get('DB_USERNAME'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_DATABASE_NAME'),
          entities: [join(__dirname, '../../**/*.orm-entity.{ts,js}')],
          uuidExtension: 'pgcrypto',
          subscribers: [join(__dirname, '../../**/**.subscribers.{ts,js}')],
          migrationsTableName: 'schema_migrations',
          migrations: [join(__dirname, 'migrations/**/**.{ts,js}')],
          migrationsRun: isTest,
          logger: 'advanced-console',
          logging: isProductionEnv ? ['error'] : (true as any),
          useUTC: true,
          ...opt,
          ...overrideOpt,
        }
        return res
      },
      inject: [ConfigService],
    })
  } catch (e) {
    console.log('error = ', e)
    return {} as DynamicModule
  }
}
