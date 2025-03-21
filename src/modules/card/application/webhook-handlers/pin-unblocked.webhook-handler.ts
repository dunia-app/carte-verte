import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { logger } from '../../../../helpers/application.helper'
import { PinUnblockedWebhookPayload } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.entity'
import { TreezorWebhookType } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.types'
import { TreezorWebhookHandler } from '../../../../libs/ddd/infrastructure/baas/treezor.webhook-handler.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { UpdateCardPinTryExceededCommand } from '../../commands/update-card-pin-try-exceeded/update-card-pin-try-exceeded.command'

@Injectable()
export class PinUnblockedWebhookHandler extends TreezorWebhookHandler {
  constructor(protected readonly commandBus: CommandBus) {
    super(TreezorWebhookType.CARD_UNBLOCKPIN)
  }

  // Webhook used when card is being locked from dashboard
  async handle(
    cardId: string,
    payload: PinUnblockedWebhookPayload,
  ): Promise<boolean> {
    const command = new UpdateCardPinTryExceededCommand({
      externalCardId: payload.cards[0].cardId.toString(),
      pinTryExceeded: payload.cards[0].pinTryExceeds == 1 ? true : false,
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
