import { Controller } from '@nestjs/common'
import { TreezorWebhookBaseController } from '../../libs/ddd/infrastructure/baas/treezor-webhook.base.controller'
import { SkipJWTAuth } from '../../libs/decorators/auth.decorator'

@Controller('webhooks')
@SkipJWTAuth()
export class BaasWebhookController extends TreezorWebhookBaseController {}
