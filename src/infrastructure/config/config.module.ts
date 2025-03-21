import { Global, Module } from '@nestjs/common'

import { ConfigService } from './config.service'

@Global()
@Module({
  providers: [
    {
      provide: ConfigService,
      useClass: ConfigService,
    },
  ],
  exports: [ConfigService],
})
export class ConfigModule {}
