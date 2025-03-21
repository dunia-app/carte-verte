import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { logger } from '../../../../helpers/application.helper'
import { PayinUpdatedWebhookPayload } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.entity'
import { TreezorWebhookType } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.types'
import { treezorPayinPropsToBaasPayinProps } from '../../../../libs/ddd/infrastructure/baas/treezor.entity'
import { TreezorWebhookHandler } from '../../../../libs/ddd/infrastructure/baas/treezor.webhook-handler.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { ValidateCardAcquisitionPayinCaptureCommand } from '../../commands/validate-card-acquisition-payin-capture/validate-card-acquisition-payin-capture.command'

@Injectable()
export class PayinValidatedWebhookHandler extends TreezorWebhookHandler {
  constructor(protected readonly commandBus: CommandBus) {
    super(TreezorWebhookType.PAYIN_UPDATE)
  }

  async handle(
    payinId: string,
    payload: PayinUpdatedWebhookPayload,
  ): Promise<boolean> {
    const formattedPayload = treezorPayinPropsToBaasPayinProps(
      payload.payins[0],
    )
    if (formattedPayload.status !== 'VALIDATED') {
      return false
    }
    if (!formattedPayload.transactionReference) {
      return false
    }
    const command = new ValidateCardAcquisitionPayinCaptureCommand({
      externalPayinId: formattedPayload.payinId,
      payinReference: formattedPayload.transactionReference,
      amount: formattedPayload.amount,
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
