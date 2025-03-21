import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { TransactionStatus } from '../../../transaction/domain/entities/transaction.types'
import { WalletRepositoryPort } from '../../database/wallet/wallet.repository.port'
import { WalletEntity } from '../../domain/entities/wallet.entity'
import { AffectBalanceTransactionCommand } from './affect-balance-transaction.command'

export async function affectBalanceTransaction(
  command: AffectBalanceTransactionCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<null, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const walletRepo: WalletRepositoryPort = unitOfWork.getWalletRepository(
    command.correlationId,
  )
  const wallets = await walletRepo.findManyByEmployeeId(command.employeeId)

  const existingAccepted =
    command.transactionStatus === TransactionStatus.Declined ||
    command.transactionStatus === TransactionStatus.Reversed ||
    command.transactionStatus === TransactionStatus.Settled
      ? await unitOfWork
          .getTransactionRepository(command.correlationId)
          .findAcceptedByExternalPaymentId(command.externalPaymentId)
      : undefined
  const existingDeclined =
    command.transactionStatus === TransactionStatus.Accepted
      ? await unitOfWork
          .getTransactionRepository(command.correlationId)
          .findDeclinedByExternalPaymentId(command.externalPaymentId)
      : undefined
  // To prevent expired transaction from being reversed
  if (
    command.transactionStatus === TransactionStatus.Reversed &&
    !!existingAccepted &&
    existingAccepted.isExpired
  ) {
    return Result.ok(null)
  }
  const declinedAfterAccepted =
    command.transactionStatus === TransactionStatus.Declined &&
    !!existingAccepted
  const directSettlement =
    command.transactionStatus === TransactionStatus.Settled && !existingAccepted
  const declinedBeforeAccepted =
    command.transactionStatus === TransactionStatus.Accepted &&
    !!existingDeclined

  const walletToSave: WalletEntity[] = []
  await Promise.all(
    Object.entries(command.advantageRepartition.unpack()).map(
      async ([advantage, amount]) => {
        const wallet = wallets.find((wallet) => wallet.advantage === advantage)!
        // affectBalanceTransaction affect balance and return true if it has changed
        if (
          wallet.affectBalanceTransaction(
            amount,
            command.transactionStatus,
            command.externalPaymentId,
            declinedBeforeAccepted,
            declinedAfterAccepted,
            directSettlement,
            command.preAuthorizationAmount,
            command.cashbackAmount,
          )
        ) {
          // Baas : Update employee card totalLimit with new balance
          walletToSave.push(wallet)
        }
      },
    ),
  )
  await walletRepo.saveMultiple(walletToSave)

  return Result.ok(null)
}
