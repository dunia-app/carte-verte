import moment = require('moment')
import { toScale } from '../../../../helpers/math.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { OrganizationRepositoryPort } from '../../../organization/database/organization/organization.repository.port'
import { TransferRepositoryPort } from '../../database/transfer/transfer.repository.port'
import { TransactionStatus } from '../../domain/entities/transaction.types'
import { TransferEntity } from '../../domain/entities/transfer.entity'
import {
  TransferDirection,
  TransferSource,
} from '../../domain/entities/transfer.types'
import { DistributeCashbackCommand } from './distribute-cashback.command'

export const maxCashbackPerMonth = 80

export async function distributeCashback(
  command: DistributeCashbackCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<TransferEntity | undefined, NotFoundException>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const organizationRepo: OrganizationRepositoryPort =
    unitOfWork.getOrganizationRepository(command.correlationId)

  const transferRepo: TransferRepositoryPort = unitOfWork.getTransferRepository(
    command.correlationId,
  )

  const organization = await organizationRepo.findOneByEmployeeIdOrThrow(
    command.employeeId,
  )

  const startOfMonth = moment().startOf('month').toDate()
  const cashbackSum = await unitOfWork
    .getEmployeeRepository(command.correlationId)
    .employeeSumCashback(command.employeeId, startOfMonth)
  if (cashbackSum >= maxCashbackPerMonth && !command.cashbackId) {
    return Result.ok(undefined)
  }

  const cashbackAmount = toScale(
    (-command.cashbackableAmount * organization.offer.advantageInShops) / 100,
  )

  // We do not create a new transfer but we need to return the existing one
  // So that we can capture the correct amount
  if (command.cashbackId) {
    const existingCashback = await transferRepo.findOneById(command.cashbackId)
    if (existingCashback && existingCashback?.amount !== cashbackAmount) {
      existingCashback!.amount = cashbackAmount
      await transferRepo.save(existingCashback)
    }
    return Result.ok(existingCashback)
  }

  if (cashbackAmount <= 0) {
    return Result.ok(undefined)
  }

  if (command.transactionStatus === TransactionStatus.Accepted) {
    const cashbackTransfer = TransferEntity.create({
      walletId: command.walletId,
      source: TransferSource.CASHBACK,
      name: `Récompense responsable`,
      paymentDate: new DateVO(
        moment(command.paymentDate).add(1, 'second').toDate(),
      ),
      amount: cashbackAmount,
      direction: TransferDirection.CREDIT,
      merchantName: command.merchantName,
    })
    await transferRepo.save(cashbackTransfer)
    return Result.ok(cashbackTransfer)
  }
  return Result.ok(undefined)
}
