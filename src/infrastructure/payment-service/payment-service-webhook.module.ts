import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { CheckoutSessionCompletedWebhookHandler } from '../../modules/card/application/webhook-handlers/checkout-session-completed.webhook-handler'
import { CheckoutSessionExpiredWebhookHandler } from '../../modules/card/application/webhook-handlers/checkout-session-expired.webhook-handler'
import { PaymentServiceWebhookController } from './payment-service-webhook'

const webhookHandlers = [
  CheckoutSessionCompletedWebhookHandler,
  CheckoutSessionExpiredWebhookHandler,
]

@Module({
  imports: [CqrsModule],
  providers: [...webhookHandlers],
  controllers: [PaymentServiceWebhookController],
  exports: [],
})
export class PaymentServiceWebhookModule {}
