import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { logger } from '../../../../helpers/application.helper'
import { CheckoutSessionCompletedWebhookPayload } from '../../../../libs/ddd/infrastructure/payment-service/stripe-webhook.entity'
import { StripeWebhookType } from '../../../../libs/ddd/infrastructure/payment-service/stripe-webhook.types'
import { StripeWebhookHandler } from '../../../../libs/ddd/infrastructure/payment-service/stripe.webhook-handler.base'
import { ConfirmCardPaymentCommand } from '../../commands/confirm-card-payment/confirm-card-payment.command'
import { ConvertToPhysicalCardCommand } from '../../commands/convert-to-physical-card/convert-to-physical-card.command'

@Injectable()
export class CheckoutSessionCompletedWebhookHandler extends StripeWebhookHandler {
  constructor(protected readonly commandBus: CommandBus) {
    super(StripeWebhookType.CHECKOUT_SESSION_COMPLETED)
  }

  // Webhook used when card is being locked from dashboard
  async handle(
    livemode: boolean,
    payload: CheckoutSessionCompletedWebhookPayload,
  ): Promise<boolean> {
    // So that tests are on test env and live is on prod
    const command = new ConfirmCardPaymentCommand({
      externalPaymentId: payload.id,
    })

    try {
      const res = await this.commandBus.execute(command)
      if (res.isErr) {
        logger.error(`[${this.constructor.name}]:error : ${res.error}`)
        return false
      }

      const convertCommand = new ConvertToPhysicalCardCommand({
        cardId: res.value,
      })
      const convertRes = await this.commandBus.execute(convertCommand)
      if (convertRes.isErr) {
        logger.error(`[${this.constructor.name}]:error : ${convertRes.error}`)
        return false
      }
      return true
    } catch (e) {
      logger.error(`[${this.constructor.name}]:error : ${e}`)
      return false
    }
  }
}
