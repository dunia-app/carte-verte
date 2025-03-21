import { Global, Module } from '@nestjs/common'
import { SmsEmitter } from './sms-emitter'

@Global()
@Module({
  imports: [],
  providers: [SmsEmitter],
  exports: [SmsEmitter],
})
export class SmsEmitterModule {}
