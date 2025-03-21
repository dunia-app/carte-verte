import { fakerFR as faker } from '@faker-js/faker'
import _ from 'lodash'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { CardRepositoryPort } from '../../../card/database/card/card.repository.port'
import { MerchantRepositoryPort } from '../../../merchant/database/merchant/merchant.repository.port'
import { transactionSuperLimit } from '../../../merchant/domain/entities/advantage.types'
import { MCC } from '../../../merchant/domain/value-objects/mcc.value-object'
import { TransactionRepositoryPort } from '../../database/transaction/transaction.repository.port'
import { TransactionEntity } from '../../domain/entities/transaction.entity'
import { TransactionFactory } from '../../domain/entities/transaction.factory'
import {
  defaultTransactionStatusToDisplay,
  TransactionDeclinedReason,
  TransactionStatus,
} from '../../domain/entities/transaction.types'
import { TransactionAlreadyExistsError } from '../../errors/transaction.errors'
import { CreateTransactionDevCommand } from './create-transaction-dev.command'
import moment = require('moment')

export async function createTransactionDev(
  command: CreateTransactionDevCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<number, TransactionAlreadyExistsError>> {
  /* Use a repository provided by UnitOfWork to include everything 
    (including changes caused by Domain Events) into one 
    atomic database transaction */
  const cardRepo: CardRepositoryPort = unitOfWork.getCardRepository(
    command.correlationId,
  )
  const merchantRepo: MerchantRepositoryPort = unitOfWork.getMerchantRepository(
    command.correlationId,
  )
  const transactionRepo: TransactionRepositoryPort =
    unitOfWork.getTransactionRepository(command.correlationId)

  const card = await cardRepo.findCurrentOneByEmployeeIdOrThrow(
    command.employeeId,
  )
  const merchants = (await merchantRepo.findMany({})).filter((m) => m.mcc)

  const transactionsCreated: TransactionEntity[] = []

  const limit = Math.min(command.toCreate, transactionSuperLimit)
  for (let i = 0; i < limit; i++) {
    const transactionStatus = _.sample(defaultTransactionStatusToDisplay)!

    const merchant = _.sample(merchants)!
    const externalPaymentId = 'local' + faker.string.numeric(6)
    const transaction: TransactionEntity = await TransactionFactory.saveOneRepo(
      transactionRepo,
      {
        cardId: card.id,
        employeeId: card.employeeId,
        merchantId: merchant.mid,
        merchantName: merchant.name,
        mcc: new MCC(merchant.mcc!),
        cardPublicToken: card.publicToken,
        externalPaymentId: externalPaymentId,
        externalTransactionId:
          'test' + externalPaymentId + transactionStatus.toString()[0],
        paymentDate: command.today
          ? new DateVO(new Date())
          : new DateVO(
              faker.date.between(
                {
                  from: moment().startOf('year').toDate(),
                  to: moment().toDate(),
                },
              ),
            ),
        amount: command.amount ? -command.amount : undefined,
        status: transactionStatus,
        declinedReason:
          transactionStatus === TransactionStatus.Declined
            ? _.sample(Object.values(TransactionDeclinedReason))
            : undefined,
      },
    )
    if (transaction.status === TransactionStatus.Settled) {
      // For a settled transaction we need to accept it first to impact the authorized balance
      await TransactionFactory.saveOneRepo(transactionRepo, {
        cardId: card.id,
        employeeId: card.employeeId,
        merchantId: merchant.mid,
        merchantName: merchant.name,
        mcc: merchant.getPropsCopy().merchantCategory!.mcc,
        cardPublicToken: card.publicToken,
        externalPaymentId: transaction.getPropsCopy().externalPaymentId,
        paymentDate: transaction.paymentDate,
        amount: transaction.amount,
        status: TransactionStatus.Accepted,
      })
    }
    transactionsCreated.push(transaction)
  }

  // We want to create one declined transaction for each declined reason
  const declinedReasons = Object.values(TransactionDeclinedReason)
  for (let i = 0; i < declinedReasons.length; i++) {
    const transactionStatus = TransactionStatus.Declined
    const merchant = _.sample(merchants)!
    const externalPaymentId = 'local' + faker.string.numeric(6)
    const transaction: TransactionEntity = await TransactionFactory.saveOneRepo(
      transactionRepo,
      {
        cardId: card.id,
        employeeId: card.employeeId,
        merchantId: merchant.mid,
        merchantName: merchant.name,
        mcc: new MCC(merchant.mcc!),
        cardPublicToken: card.publicToken,
        externalPaymentId: externalPaymentId,
        externalTransactionId:
          'test' + externalPaymentId + transactionStatus.toString()[0],
        paymentDate: command.today
          ? new DateVO(new Date())
          : new DateVO(
              faker.date.between(
                {
                  from: moment().startOf('year').toDate(),
                  to: moment().toDate(),
                },
              ),
            ),
        amount: command.amount ? -command.amount : undefined,
        status: transactionStatus,
        declinedReason: declinedReasons[i],
      },
    )
    transactionsCreated.push(transaction)
  }

  return Result.ok(transactionsCreated.length)
}