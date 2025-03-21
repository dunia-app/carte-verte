import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { logger } from '../../../../helpers/application.helper'
import { CardLockStatusUpdatedWebhookPayload } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.entity'
import { TreezorWebhookType } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.types'
import { TreezorWebhookHandler } from '../../../../libs/ddd/infrastructure/baas/treezor.webhook-handler.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { UpdateCardLockStatusCommand } from '../../commands/update-card-lock-status/update-card-lock-status.command'

@Injectable()
export class CardLockStatusUpdatedWebhookHandler extends TreezorWebhookHandler {
  constructor(protected readonly commandBus: CommandBus) {
    super(TreezorWebhookType.CARD_LOCKUNLOCK)
  }

  // Webhook used when card is being locked from dashboard
  async handle(
    cardId: string,
    payload: CardLockStatusUpdatedWebhookPayload,
  ): Promise<boolean> {
    const command = new UpdateCardLockStatusCommand({
      externalCardId: payload.cards[0].cardId.toString(),
      lockStatus: payload.cards[0].statusCode,
    })

    try {
      const res = await this.commandBus.execute(command)
      if (res.isErr) {
        return false
      }
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
