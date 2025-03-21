import { Global, Module } from '@nestjs/common'
import { AppLogger } from './logger'

@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class AppLoggerModule {}
