import { TreezorWebhookPayload } from '../../../libs/ddd/infrastructure/baas/treezor-webhook.types'
import { WebhookEntity } from './webhook.entity'

export class BaasWebhookEntity extends WebhookEntity<
  TreezorWebhookPayload<any>
> {}
