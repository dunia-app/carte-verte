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
import { CaptureCardAcquisitionPayinCommand } from './capture-card-acquisition-payin.command'

export async function captureCardAcquisitionPayin(
  command: CaptureCardAcquisitionPayinCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
  cardAcquisitionService: CardAcquisitionService,
): Promise<Result<CardAcquisitionPayinStatus, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const cardAcquisitionPayinRepo: CardAcquisitionPayinRepositoryPort =
    unitOfWork.getCardAcquisitionPayinRepository(command.correlationId)

  const payinToCapture =
    await cardAcquisitionPayinRepo.findOneByTransactionExternalPaymentIdAuthorized(
      command.transactionExternalPaymentId,
    )
  logger.info(
    `[captureCardAcquisitionPayin]:payinToCapture: ${JSON.stringify(
      payinToCapture,
    )}`,
  )
  logger.info(
    `[captureCardAcquisitionPayin]:payinToCapture.amount: ${
      payinToCapture ? payinToCapture.amount : 'null'
    }`,
  )
  logger.info(`[captureCardAcquisitionPayin]:command.amount: ${command.amount}`)
  logger.info(
    `[captureCardAcquisitionPayin]:comparaison: ${
      payinToCapture && Number(payinToCapture.amount) === Number(command.amount)
    }`,
  )
  if (
    payinToCapture &&
    Number(payinToCapture.amount) === Number(command.amount)
  ) {
    // TO delete once everyone is on hipay V2
    logger.info(
      `[captureCardAcquisitionPayin]:isOldVersion: ${payinToCapture.externalAuthorizationId?.includes(
        '_order_',
      )}`,
    )
    if (payinToCapture.externalAuthorizationId?.includes('_order_')) {
      const capturedPayin = await cardAcquisitionService.capturePayin(
        payinToCapture.reference,
        command.amount,
      )
      logger.info(
        `[captureCardAcquisitionPayin]: hipay.capturedPayin: ${JSON.stringify(
          capturedPayin,
        )}`,
      )
      if (capturedPayin.isErr) {
        logger.warn(
          `[captureCardAcquisitionPayin]:error while cancelling payin: ${capturedPayin.error}`,
        )
      }
    } else {
      const capturedPayin = await baas.capturePayin(
        payinToCapture.externalAuthorizationId!,
        command.amount,
      )
      logger.info(
        `[captureCardAcquisitionPayin]: baas.capturedPayin: ${JSON.stringify(
          capturedPayin,
        )}`,
      )
      if (capturedPayin.isErr) {
        return Result.err(capturedPayin.error)
      }
    }
    if (payinToCapture.capture(command.transactionExternalPaymentId)) {
      await cardAcquisitionPayinRepo.save(payinToCapture)
    }
    return Result.ok(payinToCapture.status)
  } else {
    if (payinToCapture) {
      try {
        // Cancel the existing one
        const cancelCommand = new CancelCardAcquisitionPayinCommand({
          correlationId: command.correlationId,
          employeeId: payinToCapture.employeeId,
          transactionExternalPaymentId: command.transactionExternalPaymentId,
        })
        await cancelCardAcquisitionPayin(
          cancelCommand,
          unitOfWork,
          baas,
          cardAcquisitionService,
        )
      } catch (e) {
        logger.warn(
          `[captureCardAcquisitionPayin]: ${payinToCapture.employeeId} ${e}`,
        )
      }
    }
    // If existing payin is not found, we directly capture the payin with a new one
    const [employeeWithInfo, cardAcquisition] = await Promise.all([
      unitOfWork
        .getEmployeeRepository(command.correlationId)
        .findOneWithInfoByIdOrThrow(command.employeeId),
      unitOfWork
        .getCardAcquisitionRepository(command.correlationId)
        .findOneActiveByEmployeeIdOrThrow(command.employeeId),
    ])
    try {
      const directPayin = await baas.directPayin(
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
      if (directPayin.isErr) {
        throw new CardAcquisitionServiceError(
          `captureCardAcquisitionPayin error: ${directPayin.error}`,
        )
      }
      const rightAmountPayin = CardAcquisitionPayinEntity.create({
        externalCardAcquisitionId: cardAcquisition.externalId,
        amount: command.amount,
        employeeId: command.employeeId,
        externalAuthorizationId: directPayin.value.externalAuthorizationId,
        reference: directPayin.value.reference,
        status: directPayin.value.status,
      })
      rightAmountPayin.capture(command.transactionExternalPaymentId)
      await cardAcquisitionPayinRepo.save(rightAmountPayin)
      return Result.ok(rightAmountPayin.status)
    } catch (error: any) {
      // If error we save the failed payin
      logger.error(
        `[captureCardAcquisitionPayin]:error while authorizing payin: ${error}`,
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
}
