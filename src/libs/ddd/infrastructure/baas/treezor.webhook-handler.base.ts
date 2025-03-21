import { WebhookHandler } from '../../../../infrastructure/webhook-listener/application/webhook-handlers/webhook-handler'
import { TreezorWebhookType } from './treezor-webhook.types'

export abstract class TreezorWebhookHandler<
  PayloadType = unknown,
> extends WebhookHandler<PayloadType> {
  public webhookType: TreezorWebhookType

  constructor(webhookType: TreezorWebhookType) {
    super()
    this.webhookType = webhookType
  }
}
