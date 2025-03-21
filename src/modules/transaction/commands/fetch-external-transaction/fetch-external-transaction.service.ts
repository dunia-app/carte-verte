import { CommandBus } from '@nestjs/cqrs'
import { pauseExec } from '../../../../helpers/application.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { CardRepositoryPort } from '../../../card/database/card/card.repository.port'
import { TransactionRepositoryPort } from '../../database/transaction/transaction.repository.port'
import { CreateTransactionCommand } from '../create-transaction/create-transaction.command'

const maxIterations = 50

export async function fetchExternalTransaction(
  commandBus: CommandBus,
  baas: Baas,
  transactionRepo: TransactionRepositoryPort,
  cardRepo: CardRepositoryPort,
  from?: Date,
  to?: Date,
  externalPaymentId?: string,
): Promise<Result<number, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  let cursor: string = ''
  let missingTransactionCount: number = 0
  do {
    const baasCardTransactionResponse = externalPaymentId
      ? await baas.getCardTransactionsByExternalPaymentId(externalPaymentId)
      : await baas.getCardTransactionsByDate(from, to, cursor)
    if (baasCardTransactionResponse.isErr) {
      return Result.err()
    }
    const externalTransactions = baasCardTransactionResponse.value.data
    if (externalTransactions.length === 0) {
      return Result.ok(0)
    }
    cursor =
      !!from &&
      !!to &&
      baasCardTransactionResponse.value.cursor &&
      externalTransactions[externalTransactions.length - 1].paymentDate > to
        ? baasCardTransactionResponse.value.cursor
        : ''
    const existingTransactions =
      await transactionRepo.findManyByExternalTransactionId(
        externalTransactions.map(
          (transaction) => transaction.externalTransactionId,
        ),
      )

    const missingTransactions = externalTransactions.filter(
      (transaction) =>
        !existingTransactions.some(
          (existingTransaction) =>
            existingTransaction.externalTransactionId ===
            transaction.externalTransactionId,
        ),
    )

    const existingCards = await cardRepo.findManyByExternalId(
      missingTransactions.map((transaction) => transaction.externalCardId),
    )

    const missingTransactionsWithCard = missingTransactions
      .filter((transaction) =>
        existingCards.find(
          (existingCard) =>
            existingCard.externalId === transaction.externalCardId,
        ),
      )
      .sort(
        (a, b) =>
          Number(a.externalTransactionId) - Number(b.externalTransactionId),
      )

    for (const transaction of missingTransactionsWithCard) {
      let i = 0
      try {
        const command = new CreateTransactionCommand({
          externalCardId: transaction.externalCardId,
          mid: transaction.mid,
          mcc: transaction.mcc,
          merchantName: transaction.merchantName,
          merchantCity: transaction.merchantCity,
          merchantCountry: transaction.merchantCountry,
          merchantAddress: transaction.merchantAddress,
          externalTransactionId: transaction.externalTransactionId,
          externalPaymentId: transaction.externalPaymentId,
          paymentDate: transaction.paymentDate,
          amount: transaction.amount,
          status: transaction.status,
          authorizationNote: transaction.authorizationNote,
          authorizationResponseCode: transaction.authorizationResponseCode,
          authorizationIssuerId: transaction.authorizationIssuerId,
          authorizationMti: transaction.authorizationMti,
          declinedReason: transaction.declinedReason,
          panEntryMethod: transaction.panEntryMethod,
        })
        await commandBus.execute(command)
      } catch (e) {}
      if (++i % maxIterations === 0) await pauseExec()
    }
    missingTransactionCount += missingTransactionsWithCard.length
  } while (cursor !== '')

  return Result.ok(missingTransactionCount)
}
