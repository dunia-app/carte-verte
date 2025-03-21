import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { TokenRequestorNeedsCertificatesError } from '../../../../libs/ddd/domain/ports/baas.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { CardNotFoundError } from '../../errors/card.errors'
import { InitiateCardDigitalizationCommand } from './initiate-card-digitalization.command'

export async function initiateCardDigitalization(
  command: InitiateCardDigitalizationCommand,
  unitOfWork: UnitOfWork,
  baas: Baas,
): Promise<
  Result<string, CardNotFoundError | TokenRequestorNeedsCertificatesError>
> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */

  try {
    const cardRepo = unitOfWork.getCardRepository(command.correlationId)
    const card = await cardRepo.findCurrentOneByEmployeeIdOrThrow(
      command.employeeId,
    )

    const credential = await baas.requestXPayCredential(
      card.externalId,
      command.xPayProvider,
      command.certificates,
      command.nonce,
      command.nonceSignature,
    )

    if (credential.isErr) {
      if (credential.error instanceof TokenRequestorNeedsCertificatesError) {
        return Result.err(credential.error)
      }
      return Result.err(new CardNotFoundError(credential.error.metadata))
    }

    const cryptogram = await baas.requestXPayCryptogram(credential.value)

    if (cryptogram.isErr) {
      return Result.err(new CardNotFoundError(cryptogram.error.metadata))
    }

    return Result.ok(cryptogram.value)
  } catch (e) {
    if (e instanceof NotFoundException) {
      return Result.err(new CardNotFoundError())
    }
    throw e
  }
}
