import { Injectable } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { logger } from '../../../../helpers/application.helper'
import { TransactionCreatedWebhookPayload } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.entity'
import { TreezorWebhookType } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.types'
import { TreezorCardTransaction } from '../../../../libs/ddd/infrastructure/baas/treezor.entity'
import { TreezorWebhookHandler } from '../../../../libs/ddd/infrastructure/baas/treezor.webhook-handler.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { CreateTransactionCommand } from '../../commands/create-transaction/create-transaction.command'

@Injectable()
export class TransactionCreatedWebhookHandler extends TreezorWebhookHandler {
  constructor(protected readonly commandBus: CommandBus) {
    super(TreezorWebhookType.CARDTRANSACTION_CREATE)
  }

  async handle(
    cardTransactionId: string,
    payload: TransactionCreatedWebhookPayload,
  ): Promise<boolean> {
    const formattedPayload = new TreezorCardTransaction(
      payload.cardtransactions[0],
    )
    const command = new CreateTransactionCommand({
      externalCardId: formattedPayload.cardId,
      mid: formattedPayload.merchantId,
      mcc: formattedPayload.mccCode,
      merchantName: formattedPayload.merchantName,
      merchantCity: formattedPayload.merchantCity,
      merchantCountry: formattedPayload.merchantCountry,
      merchantAddress: formattedPayload.merchantAddress,
      externalTransactionId: formattedPayload.cardtransactionId,
      externalPaymentId: formattedPayload.paymentId,
      paymentDate: formattedPayload.paymentDate,
      amount: formattedPayload.paymentAmount,
      status: formattedPayload.paymentStatus,
      authorizationNote: formattedPayload.authorizationNote,
      authorizationResponseCode: formattedPayload.authorizationResponseCode,
      authorizationIssuerId: formattedPayload.authorizationIssuerId,
      authorizationMti: formattedPayload.authorizationMti,
      declinedReason: formattedPayload.declinedReason,
      panEntryMethod: formattedPayload.panEntryMethod,
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
