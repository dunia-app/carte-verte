import _ from 'lodash'
import { toScale } from '../../../../helpers/math.helper'
import { objectArrayToMap } from '../../../../helpers/object.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { MerchantRepositoryPort } from '../../../merchant/database/merchant/merchant.repository.port'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { EmployeeRepositoryPort } from '../../../organization/database/employee/employee.repository.port'
import { OrganizationRepositoryPort } from '../../../organization/database/organization/organization.repository.port'
import { WalletRepositoryPort } from '../../../wallet/database/wallet/wallet.repository.port'
import { TransactionRepositoryPort } from '../../database/transaction/transaction.repository.port'
import { TransferRepositoryPort } from '../../database/transfer/transfer.repository.port'
import { TransactionEntity } from '../../domain/entities/transaction.entity'
import { TransferEntity } from '../../domain/entities/transfer.entity'
import {
  TransferDirection,
  TransferSource,
} from '../../domain/entities/transfer.types'
import { DistributeRetroactiveCashbackCommand } from './distribute-retroactive-cashback.command'
import moment = require('moment')

export async function distributeRetroactiveCashback(
  command: DistributeRetroactiveCashbackCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<null, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const transferRepo: TransferRepositoryPort = unitOfWork.getTransferRepository(
    command.correlationId,
  )
  const merchantRepo: MerchantRepositoryPort = unitOfWork.getMerchantRepository(
    command.correlationId,
  )
  const transactionRepo: TransactionRepositoryPort =
    unitOfWork.getTransactionRepository(command.correlationId)
  const employeeRepo: EmployeeRepositoryPort = unitOfWork.getEmployeeRepository(
    command.correlationId,
  )
  const walletRepo: WalletRepositoryPort = unitOfWork.getWalletRepository(
    command.correlationId,
  )
  const organizationRepo: OrganizationRepositoryPort =
    unitOfWork.getOrganizationRepository(command.correlationId)

  // Check if there is MerchantNewlyCashbackableDomainEvent
  const newMerchants = await merchantRepo.findManyByIsCashbackableSince(
    moment().subtract(1, 'day').toDate(),
  )
  if (newMerchants.length === 0) return Result.ok(null)

  // Check if there is transaction in last month to this new merchant cashback
  const transactionToCashback =
    await transactionRepo.findManyForRetroactiveCashback(
      newMerchants.map((merchant) => merchant.mid!),
      moment().subtract(1, 'month').toDate(),
    )
  if (transactionToCashback.length === 0) return Result.ok(null)

  const employees = await employeeRepo.findManyById(
    _.union(
      transactionToCashback.map((item) =>
        item.employeeId ? item.employeeId!.value : '',
      ),
    ),
  )
  const employeePerId = objectArrayToMap(employees, 'id', (it) => it.id.value)
  const walletPerEmployeeId = objectArrayToMap(
    await walletRepo.findManyByEmployeeIdAdvantage(
      _.union(employees.map((item) => item.id.value)),
      AdvantageType.NONE,
    ),
    'id',
    (it) => it.employeeId,
  )
  const organizationPerId = objectArrayToMap(
    await organizationRepo.findManyById(
      _.union(employees.map((item) => item.organizationId.value)),
    ),
    'id',
    (it) => it.id.value,
  )

  const transactionToSave: TransactionEntity[] = []
  const transferToSave: TransferEntity[] = []
  transactionToCashback.forEach((transaction) => {
    if (!transaction.employeeId) {
      return
    }
    if (transaction.cashbackId) {
      return
    }
    const employee = employeePerId.get(transaction.employeeId.value)!
    const wallet = walletPerEmployeeId.get(employee.id.value)!
    const organization = organizationPerId.get(employee.organizationId.value)!

    const cashbackAmount = toScale(
      (-transaction.amount * organization.offer.advantageInShops) / 100,
    )

    if (cashbackAmount > 0) {
      const cashbackTransfer = TransferEntity.create({
        walletId: wallet.id,
        source: TransferSource.CASHBACK,
        name: `Récompense responsable`,
        paymentDate: new DateVO(
          moment(transaction.paymentDate.value).add(1, 'second').toDate(),
        ),
        amount: cashbackAmount,
        direction: TransferDirection.CREDIT,
        merchantName: transaction.merchantName,
      })
      if (transaction.cashback(cashbackTransfer.id)) {
        transferToSave.push(cashbackTransfer)
        transactionToSave.push(transaction)
      }
    }
  })

  await transferRepo.saveMultiple(transferToSave)
  await transactionRepo.saveMultiple(transactionToSave)
  return Result.ok(null)
}
