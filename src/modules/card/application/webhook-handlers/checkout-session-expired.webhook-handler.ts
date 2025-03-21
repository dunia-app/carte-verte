import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { logger } from '../../../../helpers/application.helper'
import { CheckoutSessionExpiredWebhookPayload } from '../../../../libs/ddd/infrastructure/payment-service/stripe-webhook.entity'
import { StripeWebhookType } from '../../../../libs/ddd/infrastructure/payment-service/stripe-webhook.types'
import { StripeWebhookHandler } from '../../../../libs/ddd/infrastructure/payment-service/stripe.webhook-handler.base'
import { ExpireCardPaymentCommand } from '../../commands/expire-card-payment/expire-card-payment.command'
import { ExpirePhysicalCardRequestCommand } from '../../commands/expire-physical-card-request/expire-physical-card-request.command'

@Injectable()
export class CheckoutSessionExpiredWebhookHandler extends StripeWebhookHandler {
  constructor(protected readonly commandBus: CommandBus) {
    super(StripeWebhookType.CHECKOUT_SESSION_EXPIRED)
  }

  // Webhook used when card is being locked from dashboard
  async handle(
    livemode: boolean,
    payload: CheckoutSessionExpiredWebhookPayload,
  ): Promise<boolean> {
    // So that tests are on test env and live is on prod
    const command = new ExpireCardPaymentCommand({
      externalPaymentId: payload.id,
    })

    try {
      const res = await this.commandBus.execute(command)
      if (res.isErr) {
        logger.error(`[${this.constructor.name}]:error : ${res.error}`)
        return false
      }

      const expireCommand = new ExpirePhysicalCardRequestCommand({
        cardId: res.value,
      })
      const expireRes = await this.commandBus.execute(expireCommand)
      if (expireRes.isErr) {
        logger.error(`[${this.constructor.name}]:error : ${expireRes.error}`)
        return false
      }
      return true
    } catch (e) {
      logger.error(`[${this.constructor.name}]:error : ${e}`)
      return false
    }
  }
}
