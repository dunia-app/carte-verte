import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { logger } from '../../../../helpers/application.helper'
import { CardDigitalizationCompletedWebhookPayload } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.entity'
import { TreezorWebhookType } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.types'
import { TreezorCardDigitalization } from '../../../../libs/ddd/infrastructure/baas/treezor.entity'
import { TreezorWebhookHandler } from '../../../../libs/ddd/infrastructure/baas/treezor.webhook-handler.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { UpdateCardDigitalizationCommand } from '../../commands/update-card-digitalization/update-card-digitalization.command'

@Injectable()
export class CardDigitalizationCompletedWebhookHandler extends TreezorWebhookHandler {
  constructor(protected readonly commandBus: CommandBus) {
    super(TreezorWebhookType.CARDDIGITALIZATION_COMPLETE)
  }

  async handle(
    cardDigitizationId: string,
    payload: CardDigitalizationCompletedWebhookPayload,
  ): Promise<boolean> {
    const formattedPayload = new TreezorCardDigitalization(payload)
    const command = new UpdateCardDigitalizationCommand({
      externalCardId: formattedPayload.cardId,
      cardDigitizationId: cardDigitizationId,
      provider: formattedPayload.tokenRequestor,
      deviceName: formattedPayload.deviceName,
      deviceType: formattedPayload.deviceType,
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
