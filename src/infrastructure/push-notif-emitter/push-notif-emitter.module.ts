import { Global, Module } from '@nestjs/common'
import { PushNotifEmitter } from './push-notif-emitter'

@Global()
@Module({
  imports: [],
  providers: [PushNotifEmitter],
  exports: [PushNotifEmitter],
})
export class PushNotifEmitterModule {}
