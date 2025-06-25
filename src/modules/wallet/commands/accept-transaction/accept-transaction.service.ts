import { QueryBus } from '@nestjs/cqrs'
import { now } from '../../../../helpers/date.helper'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { CardRepositoryPort } from '../../../card/database/card/card.repository.port'
import { CardEntity } from '../../../card/domain/entities/card.entity'
import { AdvantageRepositoryPort } from '../../../merchant/database/advantage/advantage.repository.port'
import { MCC } from '../../../merchant/domain/value-objects/mcc.value-object'
import { EmployeeRepositoryPort } from '../../../organization/database/employee/employee.repository.port'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { TransactionDeclinedReason } from '../../../transaction/domain/entities/transaction.types'
import { CardAcquisitionRepositoryPort } from '../../database/card-acquisition/card-acquisition.repository.port'
import { ExternalValidationRepositoryPort } from '../../database/external-validation/external-validation.repository.port'
import { WalletRepositoryPort } from '../../database/wallet/wallet.repository.port'
import {
  CreateExternalValidationProps,
  ExternalValidationEntity,
} from '../../domain/entities/external-validation.entity'
import { ExternalValidationResponseCode } from '../../domain/entities/external-validation.types'
import { AcceptTransactionCommand } from './accept-transaction.command'

const ekipMid = '4156657'

export async function acceptTransaction(
  command: AcceptTransactionCommand,
  walletRepo: WalletRepositoryPort,
  employeeRepo: EmployeeRepositoryPort,
  cardRepo: CardRepositoryPort,
  externalValidationRepo: ExternalValidationRepositoryPort,
  advantageRepo: AdvantageRepositoryPort,
  cardAcquisitionRepo: CardAcquisitionRepositoryPort,
  queryBus: QueryBus,
): Promise<Result<ExternalValidationResponseCode, ExceptionBase>> {
  const validationProps: CreateExternalValidationProps = {
    cardPublicToken: command.cardPublicToken,
    paymentAmount: command.paymentAmount,
    paymentDate: command.paymentDate,
    mcc: new MCC(command.mcc),
    mid: command.merchantId,
    merchantName: command.merchantName,
    authorizationIssuerId: command.authorizationIssuerId,
    responseCode: ExternalValidationResponseCode.DECLINED,
    triedMerchantMatching: false,
  }

  let employee: EmployeeEntity
  let card: CardEntity

  // Check if we know the card
  try {
    card = await cardRepo.findOneByPublicTokenOrThrow(command.cardPublicToken)
    // We know the card
    validationProps.cardId = card.id
    employee = await employeeRepo.findOneByIdOrThrow(card.employeeId.value)
  } catch (e) {
    validationProps.responseCode =
      ExternalValidationResponseCode.DECLINED_CARD_UNKNOW
    return saveDecisionAndReturn(
      validationProps,
      command.time,
      externalValidationRepo,
    )
  }

  // End of experimentation 01/07/2025
  if (new Date() > new Date('2025-07-01')) {
    validationProps.declinedReason = TransactionDeclinedReason.CARD_LOCKED
    validationProps.responseCode = ExternalValidationResponseCode.DECLINED
    return saveDecisionAndReturn(
      validationProps,
      command.time,
      externalValidationRepo,
    )
  }

  // Ekip blacklist to prevent auto card acquisition
  if (command.merchantId === ekipMid) {
    validationProps.declinedReason = TransactionDeclinedReason.MERCHANT_INVALID
    validationProps.responseCode =
      ExternalValidationResponseCode.DECLINED_MCC_INVALID
    return saveDecisionAndReturn(
      validationProps,
      command.time,
      externalValidationRepo,
    )
  }

  if (employee.isFrozen || !card.isUnlock) {
    validationProps.declinedReason = TransactionDeclinedReason.CARD_LOCKED
    validationProps.responseCode = ExternalValidationResponseCode.DECLINED
    return saveDecisionAndReturn(
      validationProps,
      command.time,
      externalValidationRepo,
    )
  }

  // Single payment limit
  if (employee.defaultAuthorizedOverdraft < command.paymentAmount) {
    validationProps.declinedReason = TransactionDeclinedReason.LIMIT_REACHED
    validationProps.responseCode =
      ExternalValidationResponseCode.DECLINED_INSUFFICIENT_FUNDS
    return saveDecisionAndReturn(
      validationProps,
      command.time,
      externalValidationRepo,
    )
  }

  // Check if Mcc is valid
  if (
    !(await advantageRepo.isMccAllowed(command.mcc)) &&
    !isMerchantWhitelisted(command.merchantId, command.merchantName)
  ) {
    validationProps.declinedReason = TransactionDeclinedReason.MERCHANT_INVALID
    validationProps.responseCode =
      ExternalValidationResponseCode.DECLINED_MCC_INVALID
    return saveDecisionAndReturn(
      validationProps,
      command.time,
      externalValidationRepo,
    )
  }

  // If all check passed, we accept the transaction
  // transactionAccepted webhook will take care of the wallet repartition
  validationProps.responseCode = ExternalValidationResponseCode.AUTHORIZED
  return saveDecisionAndReturn(
    validationProps,
    command.time,
    externalValidationRepo,
  )
}

async function saveDecisionAndReturn(
  validationProps: CreateExternalValidationProps,
  time: number,
  externalValidationRepo: ExternalValidationRepositoryPort,
): Promise<Result<ExternalValidationResponseCode, ExceptionBase>> {
  const validation = ExternalValidationEntity.create(validationProps)

  // Calculate and store time
  validation.msToAnswer = now() - time
  ///
  externalValidationRepo.save(validation)
  return Result.ok(validation.responseCode)
}

function isMerchantWhitelisted(
  merchantId: string,
  merchantName: string,
): boolean {
  const whitelistFull = [
    { merchantId: '9233492', merchantName: 'SASSASSYLDIS' },
  ]
  return whitelistFull.some(
    (item) =>
      item.merchantId === merchantId && item.merchantName === merchantName,
  )
}
