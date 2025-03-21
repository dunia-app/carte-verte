import { StripeWebhookType } from './stripe-webhook.types'

export abstract class StripeWebhookHandler<PayloadType = unknown> {
  public webhookType: StripeWebhookType

  constructor(webhookType: StripeWebhookType) {
    this.webhookType = webhookType
  }

  public abstract handle(
    livemode: boolean,
    payload: PayloadType,
  ): Promise<boolean>
}
