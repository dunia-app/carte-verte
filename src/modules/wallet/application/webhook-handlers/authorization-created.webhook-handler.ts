import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { logger } from '../../../../helpers/application.helper'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CardAcquisitionServiceError } from '../../../../libs/ddd/domain/ports/card-acquisition-service.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { AuthorizationUpdatedWebhookPayload } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.entity'
import { TreezorWebhookType } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.types'
import { TreezorCardAuthorization } from '../../../../libs/ddd/infrastructure/baas/treezor.entity'
import { TreezorWebhookHandler } from '../../../../libs/ddd/infrastructure/baas/treezor.webhook-handler.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { CardAcquisitionCacheResponse } from '../../commands/request-external-card-acquisition-link/request-external-card-acquisition-link.service'
import { ValidateCardAcquisitionCommand } from '../../commands/validate-card-acquisition/validate-card-acquisition.command'
import { CardAcquisitionPayinStatus } from '../../domain/entities/card-acquisition-payin.types'

@Injectable()
export class AuthorizationCreatedWebhookHandler extends TreezorWebhookHandler {
  constructor(
    protected readonly commandBus: CommandBus,
    private readonly redis: RedisService,
  ) {
    super(TreezorWebhookType.AUTHORIZATION_CREATE)
  }

  async handle(
    authorizationId: string,
    payload: AuthorizationUpdatedWebhookPayload,
  ): Promise<boolean> {
    logger.info(
      `[${this.constructor.name}]: Start webhook handling authorizationId: ${authorizationId}`,
    )
    logger.info(
      `[${
        this.constructor.name
      }]: Start webhook handling payload: ${JSON.stringify(payload)}`,
    )
    const formattedPayload = new TreezorCardAuthorization(
      payload.authorizations[0],
    )
    logger.info(
      `[${this.constructor.name}]: Start webhook handling authorized: ${
        formattedPayload.status !== CardAcquisitionPayinStatus.Authorized
      }`,
    )
    if (formattedPayload.status !== CardAcquisitionPayinStatus.Authorized) {
      return false
    }
    logger.info(
      `[${this.constructor.name}]: Start webhook handling transactionReference: ${formattedPayload.transactionReference}`,
    )
    if (!formattedPayload.transactionReference) {
      return false
    }

    // baas.userId is our employee.externalEmployeeId
    const cardAcquisitionConfig: Result<
      CardAcquisitionCacheResponse,
      CardAcquisitionServiceError
    > = await this.redis.get(`card-acquisition:${formattedPayload.userId}`)
    logger.info(
      `[${
        this.constructor.name
      }]: Start webhook handling cardAcquisitionConfig: ${JSON.stringify(
        cardAcquisitionConfig,
      )}`,
    )
    if (!cardAcquisitionConfig || cardAcquisitionConfig.isErr) {
      return false
    }

    const command = new ValidateCardAcquisitionCommand({
      employeeId: cardAcquisitionConfig.value.employeeId,
      externalEmployeeId: formattedPayload.userId,
      orderId: cardAcquisitionConfig.value.orderId,
    })

    try {
      const res = await this.commandBus.execute(command)
      if (res.isErr) {
        return false
      }
      await this.redis.del(`card-acquisition:${formattedPayload.userId}`)
      return true
    } catch (e) {
      if (e instanceof NotFoundException) {
        logger.warn(`[${this.constructor.name}]:warning : ${e}`)
      } else {
        logger.error(`[${this.constructor.name}]:error : ${e}`)
      }
      return false
    }
  }
}
