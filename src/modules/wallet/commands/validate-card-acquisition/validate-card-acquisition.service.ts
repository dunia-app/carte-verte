import { logger } from '../../../../helpers/application.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CardAcquisitionServiceError } from '../../../../libs/ddd/domain/ports/card-acquisition-service.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { CardAcquisitionRepositoryPort } from '../../database/card-acquisition/card-acquisition.repository.port'
import { CardAcquisitionPayinStatus } from '../../domain/entities/card-acquisition-payin.types'
import { CardAcquisitionEntity } from '../../domain/entities/card-acquisition.entity'
import { CardAcquisitionToken } from '../../domain/value-objects/card-acquisition-token.value-object'
import { CardAcquisitionAlreadyExistsError } from '../../errors/card-acquisition.errors'
import { CancelCardAcquisitionCommand } from '../cancel-card-acquisition/cancel-card-acquisition.command'
import { cancelCardAcquisition } from '../cancel-card-acquisition/cancel-card-acquisition.service'
import { ValidateCardAcquisitionCommand } from './validate-card-acquisition.command'

export async function validateCardAcquisition(
  command: ValidateCardAcquisitionCommand,
  unitOfWork: UnitOfWork,
  cardAcquisitionService: CardAcquisitionService,
  baas: Baas,
  config: ConfigService,
): Promise<Result<boolean, CardAcquisitionAlreadyExistsError>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardAcquisitionRepo: CardAcquisitionRepositoryPort =
    unitOfWork.getCardAcquisitionRepository(command.correlationId)
  logger.info(
    `[validateCardAcquisition]: cardAcquisitionToken: ${command.orderId}`,
  )
  const externalCardAcquisitionId =
    cardAcquisitionService.getExternalCardAcquisitionId(command.orderId)
  // ValidateCardAcquisition uniqueness guard
  if (await cardAcquisitionRepo.exists(externalCardAcquisitionId)) {
    /** Returning an Error instead of throwing it
     *  so a controller can handle it explicitly */
    return Result.err(new CardAcquisitionAlreadyExistsError())
  }

  const cardAcquisitionToken = await cardAcquisitionService.getCardAcquisition(
    externalCardAcquisitionId,
    command.externalEmployeeId,
  )
  logger.info(
    `[validateCardAcquisition]: cardAcquisitionToken: ${cardAcquisitionToken}`,
  )

  if (
    cardAcquisitionToken.isErr ||
    cardAcquisitionToken.value.status === CardAcquisitionPayinStatus.Failed
  ) {
    const error = cardAcquisitionToken.isErr
      ? cardAcquisitionToken.error
      : new CardAcquisitionServiceError(
          `card acquisition failed status : ${cardAcquisitionToken.value.status}`,
        )
    logger.info(`Error while getting card acquisition: ${error}`)
    return Result.err(error)
  }

  // we delete existing cardAcquisition
  try {
    await cancelCardAcquisition(
      new CancelCardAcquisitionCommand({
        employeeId: command.employeeId,
        externalEmployeeId: command.externalEmployeeId,
        correlationId: command.correlationId,
      }),
      unitOfWork,
      baas,
      cardAcquisitionService,
    )
  } catch (e) {
    logger.info(`Error while canceling existing card acquisition: ${e}`)
  }

  // Cancel temporary authorization
  try {
    await cardAcquisitionService.cancelPayin(
      cardAcquisitionToken.value.reference,
    )
  } catch (e) {
    logger.error('Error while canceling existing card acquisition payin', e)
  }

  const baasCardAcquisition = await baas.createBaasCardAcquisition(
    cardAcquisitionToken.value.token,
  )
  if (baasCardAcquisition.isErr) {
    return Result.err(baasCardAcquisition.error)
  }
  const cardAcquisition = CardAcquisitionEntity.create({
    employeeId: command.employeeId,
    externalId: externalCardAcquisitionId,
    token: CardAcquisitionToken.generate(
      cardAcquisitionToken.value.token,
      config.getStr('APP_SECRET'),
      config.getStr('APP_SALT'),
    ),
    maskedPan: cardAcquisitionToken.value.maskedPan,
    isActive: true,
    paymentProduct: cardAcquisitionToken.value.paymentProduct,
    status: cardAcquisitionToken.value.status,
    baasId: baasCardAcquisition.value,
  })

  await cardAcquisitionRepo.save(cardAcquisition)

  return Result.ok(true)
}
