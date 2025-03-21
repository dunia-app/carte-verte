import { logger } from '../../../../helpers/application.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CardAcquisitionServiceError } from '../../../../libs/ddd/domain/ports/card-acquisition-service.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { CardAcquisitionPayinRepositoryPort } from '../../database/card-acquisition-payin/card-acquisition-payin.repository.port'
import { CardAcquisitionPayinEntity } from '../../domain/entities/card-acquisition-payin.entity'
import { CardAcquisitionPayinStatus } from '../../domain/entities/card-acquisition-payin.types'
import { CancelCardAcquisitionPayinCommand } from '../cancel-card-acquisition-payin/cancel-card-acquisition-payin.command'
import { cancelCardAcquisitionPayin } from '../cancel-card-acquisition-payin/cancel-card-acquisition-payin.service'
import { AuthorizeCardAcquisitionPayinCommand } from './authorize-card-acquisition-payin.command'

export async function authorizeCardAcquisitionPayin(
  command: AuthorizeCardAcquisitionPayinCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
  cardAcquisitionService: CardAcquisitionService,
): Promise<Result<CardAcquisitionPayinStatus, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardAcquisitionPayinRepo: CardAcquisitionPayinRepositoryPort =
    unitOfWork.getCardAcquisitionPayinRepository(command.correlationId)

  if (command.transactionExternalPaymentId) {
    const existingPayin =
      await cardAcquisitionPayinRepo.findOneByTransactionExternalPaymentIdAuthorizedOrCaptured(
        command.transactionExternalPaymentId,
      )
    if (existingPayin) {
      return Result.err(
        new CardAcquisitionServiceError(
          'Payin already exists for this transaction',
        ),
      )
    }
  }

  const [employee, employeeWithInfo, cardAcquisition] = await Promise.all([
    unitOfWork
      .getEmployeeRepository(command.correlationId)
      .findOneByIdOrThrow(command.employeeId),
    unitOfWork
      .getEmployeeRepository(command.correlationId)
      .findOneWithInfoByIdOrThrow(command.employeeId),
    unitOfWork
      .getCardAcquisitionRepository(command.correlationId)
      .findOneActiveByEmployeeIdOrThrow(command.employeeId),
  ])

  try {
    // Cancel the existing one
    const cancelCommand = new CancelCardAcquisitionPayinCommand({
      correlationId: command.correlationId,
      employeeId: employee.id.value,
    })
    await cancelCardAcquisitionPayin(
      cancelCommand,
      unitOfWork,
      baas,
      cardAcquisitionService,
    )
  } catch (e) {
    logger.warn(`[renewCardAcquisitionPayin]: ${employee.id.value} ${e}`)
  }

  try {
    const authorizedPayin = await baas.authorizePayin(
      command.amount,
      cardAcquisition.paymentProduct,
      cardAcquisition.baasId,
      employeeWithInfo.firstname,
      employeeWithInfo.lastname,
      employeeWithInfo.email,
      new Address({
        city: employeeWithInfo.city ? employeeWithInfo.city : 'Paris',
        postalCode: employeeWithInfo.postalCode,
        street: employeeWithInfo.street,
      }),
      employeeWithInfo.firstname + ' ' + employeeWithInfo.lastname,
    )
    if (authorizedPayin.isErr) {
      throw new CardAcquisitionServiceError(
        `AuthorizedPayin error: ${authorizedPayin.error}`,
      )
    }
    const cardAcquisitionAuthorizePayin = CardAcquisitionPayinEntity.create({
      externalCardAcquisitionId: cardAcquisition.externalId,
      amount: command.amount,
      employeeId: command.employeeId,
      externalAuthorizationId: authorizedPayin.value.externalAuthorizationId,
      reference: authorizedPayin.value.reference,
      status: authorizedPayin.value.status,
      transactionExternalPaymentId: command.transactionExternalPaymentId,
    })

    await cardAcquisitionPayinRepo.save(cardAcquisitionAuthorizePayin)
    return Result.ok(authorizedPayin.value.status)
  } catch (error: any) {
    logger.error(
      `[authorizeCardAcquisitionPayin]:error while authorizing payin: ${error}`,
    )
    // Extract error code and message from the error string
    const errorCodeMatch = error.toString().match(/"code":\s*"([^"]+)"/)
    const errorMessageMatch = error.toString().match(/"message":\s*"([^"]+)"/)
    const hipayError = {
      code: errorCodeMatch ? errorCodeMatch[1] : 'unknown_error_code',
      message: errorMessageMatch
        ? errorMessageMatch[1]
        : 'unknown_error_message',
    }
    const cardAcquisitionFailedPayin = CardAcquisitionPayinEntity.create({
      externalCardAcquisitionId: cardAcquisition.externalId,
      amount: command.amount,
      employeeId: command.employeeId,
      externalAuthorizationId: 'null',
      reference: 'null',
      status: CardAcquisitionPayinStatus.Failed,
      transactionExternalPaymentId: command.transactionExternalPaymentId,
      errorCode: hipayError.code,
      errorMessage: hipayError.message,
    })

    await cardAcquisitionPayinRepo.save(cardAcquisitionFailedPayin)
    return Result.ok(cardAcquisitionFailedPayin.status)
  }
}
