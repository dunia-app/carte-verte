import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { MerchantRepositoryPort } from '../../database/merchant/merchant.repository.port'
import { UpdateMerchantMccCommand } from './update-merchant-mcc.command'

export async function updateMerchantMcc(
  command: UpdateMerchantMccCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<null, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const merchantRepo: MerchantRepositoryPort = unitOfWork.getMerchantRepository(
    command.correlationId,
  )

  await merchantRepo.updateManyWithoutMcc()
  return Result.ok(null)
}
