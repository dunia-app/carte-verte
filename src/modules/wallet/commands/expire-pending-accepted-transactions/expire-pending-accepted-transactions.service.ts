import { pauseExec } from '../../../../helpers/application.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { TransactionRepositoryPort } from '../../../transaction/database/transaction/transaction.repository.port'
import { TransactionEntity } from '../../../transaction/domain/entities/transaction.entity'
import { TransactionStatus } from '../../../transaction/domain/entities/transaction.types'
import { WalletRepositoryPort } from '../../database/wallet/wallet.repository.port'
import { WalletEntity } from '../../domain/entities/wallet.entity'
import { ExpirePendingAcceptedTransactionsCommand } from './expire-pending-accepted-transactions.command'

const daysToBeExpired = 10

export async function expirePendingAcceptedTransactions(
  command: ExpirePendingAcceptedTransactionsCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<number, ExceptionBase>> {
  const batchSize = 4000
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const transactionRepo: TransactionRepositoryPort =
    unitOfWork.getTransactionRepository(command.correlationId)
  const walletRepo: WalletRepositoryPort = unitOfWork.getWalletRepository(
    command.correlationId,
  )

  const transactionsCount = await transactionRepo.countPendingToBeExpired(
    daysToBeExpired,
  )
  if (transactionsCount === 0) return Result.ok(0)

  let trSaved = 0

  for (let i = 0; i < transactionsCount; i += batchSize) {
    const transactions = await transactionRepo.findManyPendingToBeExpired(
      daysToBeExpired,
      batchSize,
    )
    const employeeIds = new Set(
      transactions
        .map((tr) => tr.employeeId?.value)
        .filter((id): id is string => !isUndefined(id)),
    )
    const wallets = await walletRepo.findManyByEmployeeIds([...employeeIds])

    const trToSave: TransactionEntity[] = []
    const walletToSave: Map<string, WalletEntity> = new Map()
    transactions.map((tr) => {
      const isExpired = tr.expire()
      if (isExpired.isErr) return
      trToSave.push(tr)

      if (isUndefined(tr.employeeId)) return

      const employeeWallet = wallets.filter(
        (wallet) => wallet.employeeId === tr.employeeId!.value,
      )
      if (employeeWallet.length === 0) return

      Object.entries(tr.advantageRepartition).map(([advantage, amount]) => {
        const wallet = employeeWallet.find(
          (wallet) => wallet.advantage === advantage,
        )
        if (!wallet) return
        if (
          wallet.affectBalanceTransaction(
            amount,
            TransactionStatus.Reversed,
            tr.externalPaymentId,
          )
        ) {
          // So that we only save the wallet that changed in DB
          walletToSave.set(wallet.id.value, wallet)
        }
      })
    })

    const promises: Promise<any>[] = []
    if (trToSave.length) {
      promises.push(transactionRepo.saveMultiple(trToSave))
      trSaved += trToSave.length
    }
    if (walletToSave.size) {
      promises.push(walletRepo.saveMultiple([...walletToSave.values()]))
    }
    await Promise.all(promises)

    await pauseExec()
  }
  return Result.ok(trSaved)
}
