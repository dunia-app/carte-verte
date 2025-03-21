import { HttpModule } from '@nestjs/axios'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { CsvModule } from 'nest-csv-parser'
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis'
import { BaasWebhookModule } from './infrastructure/baas/baas-webhook.module'
import { BankAccountManagerModule } from './infrastructure/bank-account-manager/bank-account-manager.module'
import { CardAcquisitionServiceModule } from './infrastructure/card-acquisition-service/card-acquisition-service.module'
import { ConfigModule } from './infrastructure/config/config.module'
import { ConfigService } from './infrastructure/config/config.service'
import { DataVisualizerModule } from './infrastructure/data-visualizer/data-visualizer.module'
import { buildTypOrmModule } from './infrastructure/database/build_database'
import { UnitOfWorkModule } from './infrastructure/database/unit-of-work/unit-of-work.module'
import { AppGraphqlModule } from './infrastructure/graphql/graphql.module'
import { AppThrottlerGuard } from './infrastructure/guards/throttler.gard'
import { HealthcheckModule } from './infrastructure/healthcheck/healthcheck.module'
import { TranslateErrorMessageInterceptor } from './infrastructure/interceptors/translate-error-message.interceptor'
import { AppLoggerModule } from './infrastructure/logger/logger.module'
import { BasicAuthMiddleware } from './infrastructure/middleware/basic-auth.middleware'
import { PaymentServiceWebhookModule } from './infrastructure/payment-service/payment-service-webhook.module'
import { PlaceAutocompleteModule } from './infrastructure/place-autocomplete/place-autocomplete.module'
import { RedisModule } from './infrastructure/redis/redis.module'
import { RedisService } from './infrastructure/redis/redis.service'
import { WebhookListenerModule } from './infrastructure/webhook-listener/webhook-listener.module'
import { AuthModule } from './modules/auth/auth.module'
import { CardModule } from './modules/card/card.module'
import { MerchantModule } from './modules/merchant/merchant.module'
import { MessageModule } from './modules/message/message.module'
import { OrganizationModule } from './modules/organization/organization.module'
import { TransactionModule } from './modules/transaction/transaction.module'
import { UserModule } from './modules/user/user.module'
import { WalletModule } from './modules/wallet/wallet.module'

const infrastructureModules = [
  buildTypOrmModule(),
  AppGraphqlModule,
  AppLoggerModule,
  BaasWebhookModule,
  BankAccountManagerModule,
  CardAcquisitionServiceModule,
  DataVisualizerModule,
  HealthcheckModule,
  PaymentServiceWebhookModule,
  PlaceAutocompleteModule,
  RedisModule,
  UnitOfWorkModule,
  WebhookListenerModule,
]

const dddModules = [
  AuthModule,
  CardModule,
  MerchantModule,
  MessageModule,
  OrganizationModule,
  TransactionModule,
  UserModule,
  WalletModule,
]
@Module({
  imports: [
    AuthModule,
    ConfigModule,
    CsvModule,
    HttpModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      inject: [RedisService],
      useFactory: (redis: RedisService) => ({
        ttl: 1,
        limit: 10,
        storage: new ThrottlerStorageRedisService(redis.persist),
        throttlers: [], // Add an empty array or provide the desired throttlers
      }),
    }),
    ...infrastructureModules,
    ...dddModules,
    buildTypOrmModule(),
  ],
  providers: [
    ConfigService,
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TranslateErrorMessageInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BasicAuthMiddleware).forRoutes('/graphql')
  }
}
