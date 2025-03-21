import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { EmployeeNotActivatedError } from '../../../organization/errors/employee.errors'
import { TransferDirection } from '../../../transaction/domain/entities/transfer.types'
import { WalletRepositoryPort } from '../../database/wallet/wallet.repository.port'
import { CreditWalletDevCommand } from './credit-wallet-dev.command'

export async function creditWalletDev(
  command: CreditWalletDevCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<number, EmployeeNotActivatedError>> {
  /* Use a repository provided by UnitOfWork to include everything 
    (including changes caused by Domain Events) into one 
    atomic database transaction */
  const walletRepo: WalletRepositoryPort = unitOfWork.getWalletRepository(
    command.correlationId,
  )

  // for the moment we only handle MEALTICKET so we only query those wallets
  const found = await walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
    command.employeeId,
    AdvantageType.MEALTICKET,
  )
  found.affectBalanceTransfer(command.amount, TransferDirection.CREDIT)

  await walletRepo.save(found)
  return Result.ok(found.balance)
}
