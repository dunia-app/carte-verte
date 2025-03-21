import { Body, Headers, Injectable, Post, Response } from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { logger } from '../../../../helpers/application.helper'
import { CheckoutSessionCompletedWebhookHandler } from '../../../../modules/card/application/webhook-handlers/checkout-session-completed.webhook-handler'
import { CheckoutSessionExpiredWebhookHandler } from '../../../../modules/card/application/webhook-handlers/checkout-session-expired.webhook-handler'
import { StripeWebhookGuard } from './stripe-webhook.guard'
import { StripeWebhookPayload, StripeWebhookType } from './stripe-webhook.types'
import { StripeWebhookHandler } from './stripe.webhook-handler.base'

@Injectable()
export class StripeWebhookBaseController {
  handleWebhooks: {
    [key in StripeWebhookType]?: StripeWebhookHandler<any>
  }
  constructor(
    readonly checkoutSessionCompletedWebhookHandler: CheckoutSessionCompletedWebhookHandler,
    readonly checkoutSessionExpiredWebhookHandler: CheckoutSessionExpiredWebhookHandler,
  ) {
    this.handleWebhooks = {
      [StripeWebhookType.CHECKOUT_SESSION_COMPLETED]:
        checkoutSessionCompletedWebhookHandler,
      [StripeWebhookType.CHECKOUT_SESSION_EXPIRED]:
        checkoutSessionExpiredWebhookHandler,
    }
  }

  @Post()
  @StripeWebhookGuard()
  async handleStripeWebhook(
    @Body() body: StripeWebhookPayload<any>,
    @Response() resp: FastifyReply,
    @Headers('content-type') contentType: string,
  ) {
    const formattedBody: StripeWebhookPayload<any> =
      contentType === 'text/plain; charset=UTF-8'
        ? JSON.parse(String(body))
        : body
    logger.log(
      `[${this.constructor.name}]: start action on stripe hook ${formattedBody.type}`,
    )

    const webhook = Object.values(StripeWebhookType).find(
      (type) => type === formattedBody.type,
    )
    if (!webhook) return resp.status(200).send()
    const handler = this.handleWebhooks[webhook]
    if (!handler) return resp.status(200).send()

    handler.handle(formattedBody.livemode, formattedBody.data.object)

    return resp.status(200).send()
  }
}