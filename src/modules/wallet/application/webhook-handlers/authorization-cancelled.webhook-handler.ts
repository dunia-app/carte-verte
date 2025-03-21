import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { AuthorizationUpdatedWebhookPayload } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.entity'
import { TreezorWebhookType } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.types'
import { TreezorCardAuthorization } from '../../../../libs/ddd/infrastructure/baas/treezor.entity'
import { TreezorWebhookHandler } from '../../../../libs/ddd/infrastructure/baas/treezor.webhook-handler.base'
import { CardAcquisitionPayinStatus } from '../../domain/entities/card-acquisition-payin.types'

@Injectable()
export class AuthorizationCancelledWebhookHandler extends TreezorWebhookHandler {
  constructor(
    protected readonly commandBus: CommandBus,
    private readonly redis: RedisService,
  ) {
    super(TreezorWebhookType.AUTHORIZATION_CANCEL)
  }

  async handle(
    authorizationId: string,
    payload: AuthorizationUpdatedWebhookPayload,
  ): Promise<boolean> {
    const formattedPayload = new TreezorCardAuthorization(
      payload.authorizations[0],
    )
    if (
      formattedPayload.authorizationStatus !== CardAcquisitionPayinStatus.Failed
    ) {
      return false
    }
    if (!formattedPayload.transactionReference) {
      return false
    }
    // baas.userId is our employee.externalEmployeeId
    const cardAcquisitionConfig = await this.redis.get(
      `card-acquisition:${formattedPayload.userId}`,
    )
    if (cardAcquisitionConfig) {
      this.redis.del(`card-acquisition:${formattedPayload.userId}`)
      return true
    } else {
      // authorization cancelled so probably notif to inform user ?
    }
    return true
  }
}
