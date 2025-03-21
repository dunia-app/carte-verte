import moment = require('moment')
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { WalletRepositoryPort } from '../../../wallet/database/wallet/wallet.repository.port'
import { TransferRepositoryPort } from '../../database/transfer/transfer.repository.port'
import { TransferEntity } from '../../domain/entities/transfer.entity'
import { TransferFactory } from '../../domain/entities/transfer.factory'
import {
  TransferDirection,
  TransferSource,
} from '../../domain/entities/transfer.types'
import { CreateTransferDevCommand } from './create-transfer-dev.command'

export async function createTransferDev(
  command: CreateTransferDevCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<number>> {
  /* Use a repository provided by UnitOfWork to include everything 
    (including changes caused by Domain Events) into one 
    atomic database transaction */
  const walletRepo: WalletRepositoryPort = unitOfWork.getWalletRepository(
    command.correlationId,
  )
  const transferRepo: TransferRepositoryPort = unitOfWork.getTransferRepository(
    command.correlationId,
  )

  const wallet = await walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
    command.employeeId,
    AdvantageType.MEALTICKET,
  )

  const transfersCreated: TransferEntity[] = []

  const limit = Math.min(command.toCreate, 5)
  for (let i = 0; i < limit; i++) {
    const transferDate = moment().subtract(i, 'month').startOf('month')
    const transferName = `Recharge ${
      transferDate.get('month') + 1
    }/${transferDate.get('year')}`
    const transfer: TransferEntity = await TransferFactory.saveOneRepo(
      transferRepo,
      {
        walletId: wallet.id,
        source: TransferSource.MEAL_TICKET_CREDIT,
        name: transferName,
        paymentDate: new DateVO(transferDate.toISOString()),
        amount: command.amount,
        direction: TransferDirection.CREDIT,
      },
    )
    transfersCreated.push(transfer)
  }

  return Result.ok(transfersCreated.length)
}
