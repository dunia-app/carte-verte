import { Controller } from '@nestjs/common'
import { StripeWebhookBaseController } from '../../libs/ddd/infrastructure/payment-service/stripe-webhook.base.controller'
import { SkipJWTAuth } from '../../libs/decorators/auth.decorator'

@Controller('payment-service-webhooks')
@SkipJWTAuth()
export class PaymentServiceWebhookController extends StripeWebhookBaseController {}
