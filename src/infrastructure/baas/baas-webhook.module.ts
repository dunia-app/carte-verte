import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { WebhookListenerModule } from '../webhook-listener/webhook-listener.module'
import { BaasWebhookController } from './baas-webhook'

@Module({
  imports: [CqrsModule, WebhookListenerModule],
  providers: [],
  controllers: [BaasWebhookController],
  exports: [],
})
export class BaasWebhookModule {}
