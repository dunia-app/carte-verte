import { Global, Module } from '@nestjs/common'
import { MessageEmitter } from './message-emitter'

@Global()
@Module({
  imports: [],
  providers: [MessageEmitter],
  exports: [MessageEmitter],
})
export class MessageEmitterModule {}
