import { Baas } from '../../../../infrastructure/baas/baas'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/exception.base'
import { CreateBaasAcquisitionsCommand } from './create-baas-acquisitions.command'

export async function createBaasAcquisitions(
  command: CreateBaasAcquisitionsCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
  config: ConfigService,
): Promise<Result<boolean, ExceptionBase>> {
  const cardAcquisitionRepo = unitOfWork.getCardAcquisitionRepository(
    command.correlationId,
  )
  const cardAcquisition = command.cardAcquisition

  const baasCardAcquisition = await baas.createBaasCardAcquisition(
    cardAcquisition.token.getDecryptedValue(
      config.getStr('APP_SECRET'),
      config.getStr('APP_SALT'),
    ),
  )
  if (baasCardAcquisition.isOk) {
    cardAcquisition.baasId = baasCardAcquisition.value
    await cardAcquisitionRepo.save(cardAcquisition)
    return Result.ok(true)
  }

  return Result.err(baasCardAcquisition.error)
}
