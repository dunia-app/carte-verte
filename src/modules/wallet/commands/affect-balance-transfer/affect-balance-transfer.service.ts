import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { WalletRepositoryPort } from '../../database/wallet/wallet.repository.port'
import { AffectBalanceTransferCommand } from './affect-balance-transfer.command'

export async function affectBalanceTransfer(
  command: AffectBalanceTransferCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<null, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transfer */
  const walletRepo: WalletRepositoryPort = unitOfWork.getWalletRepository(
    command.correlationId,
  )

  const found = await walletRepo.findOneByIdOrThrow(command.walletId)

  // affectBalanceTransfer affect balance and return if it has changed
  if (found.affectBalanceTransfer(command.amount, command.transferDirection)) {
    // Baas : Update employee card totalLimit with new balance
    await walletRepo.save(found)
  }

  return Result.ok(null)
}
