import { logger } from '../../../../helpers/application.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { TransactionRepositoryPort } from '../../../transaction/database/transaction/transaction.repository.port'
import { CaptureCardAcquisitionPayinCommand } from '../capture-card-acquisition-payin/capture-card-acquisition-payin.command'
import { captureCardAcquisitionPayin } from '../capture-card-acquisition-payin/capture-card-acquisition-payin.service'
import { CaptureUncapturedTransactionCommand } from './capture-uncaptured-transaction.command'

const batchSize = 50

export async function captureUncapturedTransaction(
  command: CaptureUncapturedTransactionCommand,
  unitOfWork: UnitOfWork,
  config: ConfigService,
  baas: Baas,
  cardAcquisition: CardAcquisitionService,
): Promise<Result<number, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const transactionRepo: TransactionRepositoryPort =
    unitOfWork.getTransactionRepository(command.correlationId)

  const uncapturedTransactions =
    await transactionRepo.findManyExternalUncaptured(batchSize)
  if (uncapturedTransactions.length === 0) {
    return Result.ok(0)
  }
  let capturedTransactionCount = 0
  for (const uncapturedTransaction of uncapturedTransactions) {
    try {
      const captureCommand = new CaptureCardAcquisitionPayinCommand({
        employeeId: uncapturedTransaction.employeeId!.value,
        amount:
          -uncapturedTransaction.advantageRepartition[AdvantageType.EXTERNAL]!,
        transactionExternalPaymentId: uncapturedTransaction.externalPaymentId,
        correlationId: command.correlationId,
      })
      const capturedTransaction = await captureCardAcquisitionPayin(
        captureCommand,
        unitOfWork,
        baas,
        cardAcquisition,
      )
      if (capturedTransaction.isErr) {
        return Result.err(capturedTransaction.error)
      } else {
        capturedTransactionCount++
      }
    } catch (error: any) {
      logger.error(`[captureUncapturedTransaction]: ${error}`)
    }
  }

  return Result.ok(capturedTransactionCount)
}
