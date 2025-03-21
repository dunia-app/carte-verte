import _ from 'lodash'
import { toScale } from '../../../../helpers/math.helper'
import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  ArgumentInvalidException,
  ArgumentOutOfRangeException,
} from '../../../../libs/exceptions/index'
import { MCC } from '../../../merchant/domain/value-objects/mcc.value-object'
import { TransactionAlreadyExpiredError } from '../../errors/transaction.errors'
import { TransactionActivatePhysicalCardDomainEvent } from '../events/transaction-activate-physical-card.domain-event'
import { TransactionCreatedDomainEvent } from '../events/transaction-created.domain-event'
import { BaasAuthorizationResponseCode } from '../value-objects/baas-authorization-response-code.value-object'
import {
  TransactionAdvantageRepartition,
  TransactionAdvantageRepartitionProps,
} from '../value-objects/transaction-advantage-repartition.value-object'
import { AdvantageType } from './../../../merchant/domain/entities/advantage.types'
import {
  TransactionDeclinedReason,
  TransactionStatus,
} from './transaction.types'

export type BalanceByAdvantageItem = {
  advantage: AdvantageType
  amount: number
  limit?: number
}

export type BalanceByAdvantage = BalanceByAdvantageItem[]

// Properties that are needed for a user creation
export interface CreateTransactionProps {
  cardId?: UUID
  employeeId?: UUID
  merchantId: string
  merchantName: string
  mcc: MCC
  cardPublicToken: string
  externalTransactionId: string
  externalPaymentId: string
  paymentDate: DateVO
  amount: number
  status: TransactionStatus
  authorizationNote?: string
  authorizationResponseCode: BaasAuthorizationResponseCode
  declinedReason?: TransactionDeclinedReason
  expiredAt?: DateVO
  advantageRepartition: TransactionAdvantageRepartition
  cashbackId?: UUID
  authorizationIssuerId?: string
  authorizationMti: string
}

// All properties that a Transaction has
export interface TransactionProps extends CreateTransactionProps {}

export class TransactionEntity extends AggregateRoot<TransactionProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(
    create: CreateTransactionProps,
    preAuthorizationAmount?: number,
    cashbackAmount?: number,
  ): TransactionEntity {
    const id = UUID.generate()
    const props: TransactionProps = {
      ...create,
    }
    const transaction = new TransactionEntity({ id, props })

    transaction.addEvent(
      new TransactionCreatedDomainEvent({
        aggregateId: transaction.id.value,
        employeeId: props.employeeId!.value,
        merchantName: props.merchantName,
        mid: props.merchantId,
        amount: props.amount,
        transactionStatus: props.status,
        externalPaymentId: props.externalPaymentId,
        declinedReason: props.declinedReason,
        advantageRepartition: props.advantageRepartition,
        preAuthorizationAmount: preAuthorizationAmount,
        paymentDate: props.paymentDate.value,
        cashbackAmount: cashbackAmount,
      }),
    )

    return transaction
  }

  get employeeId(): UUID | undefined {
    return this.props.employeeId
  }

  get paymentDate(): DateVO {
    return this.props.paymentDate
  }

  get merchantName(): string {
    return this.props.merchantName
  }

  get amount(): number {
    return this.props.amount
  }

  get status(): TransactionStatus {
    return this.props.status
  }

  get isExpired(): boolean {
    return !_.isUndefined(this.props.expiredAt)
  }

  get advantageRepartition(): TransactionAdvantageRepartitionProps {
    return TransactionAdvantageRepartition.getProps(
      this.props.advantageRepartition,
    )
  }

  get cashbackableAmount(): number {
    return this.props.advantageRepartition.cashbackableAmount()
  }

  get cashbackId(): UUID | undefined {
    return this.props.cashbackId
  }

  get merchantId(): string {
    return this.props.merchantId
  }

  cashback(cashbackId: UUID) {
    if (!this.isCashbacked) {
      this.props.cashbackId = cashbackId
      return true
    }
    return false
  }

  get isCashbacked(): boolean {
    return !_.isUndefined(this.props.cashbackId)
  }

  get authorizationNote(): string | undefined {
    return this.props.authorizationNote
  }

  get externalTransactionId(): string {
    return this.props.externalTransactionId
  }

  get externalPaymentId(): string {
    return this.props.externalPaymentId
  }

  /**
   * Allocate a transaction to advantage according to their balance
   * @param balanceByAdvantage List of balance per advantage, order is important, first will be emptied first
   */
  static allocateTransactionToAdvantage(
    amount: number,
    balanceByAdvantage: BalanceByAdvantage,
  ) {
    const advantageRepartition: TransactionAdvantageRepartitionProps = {}
    let amountLeft = Math.abs(amount)
    const amountSign = amount < 0 ? -1 : 1
    balanceByAdvantage.every((balance) => {
      // We only accept one of each advantage in the repartition
      // So we skip if we already set this advantage
      if (!_.isUndefined(advantageRepartition[balance.advantage])) {
        return true
      }
      // If credit we put everything in the first wallet
      if (amountLeft < 0) {
        advantageRepartition[balance.advantage] = -toScale(amountLeft, 2)
        amountLeft = 0
        return false
      }
      const amountToAllocate =
        amountLeft <= balance.amount ? amountLeft : balance.amount
      if (amountToAllocate !== 0) {
        advantageRepartition[balance.advantage] =
          amountSign * toScale(amountToAllocate, 2)
        amountLeft -= amountToAllocate
      }
      // When we return false it stops the every() loop
      return amountLeft !== 0
    })
    // In case we looped through every advantage, we put the amountLeft in EXTERNAL if it exists
    // if not, we put it in NONE wallet
    // Event if its balance become negative
    if (amountLeft !== 0 || Object.keys(advantageRepartition).length === 0) {
      if (
        balanceByAdvantage.find(
          (balance) => balance.advantage === AdvantageType.EXTERNAL,
        )
      ) {
        advantageRepartition[AdvantageType.EXTERNAL] = toScale(
          (advantageRepartition[AdvantageType.EXTERNAL] || 0) +
            amountSign * amountLeft,
          2,
        )
      } else {
        advantageRepartition[AdvantageType.NONE] = toScale(
          (advantageRepartition[AdvantageType.NONE] || 0) +
            amountSign * amountLeft,
          2,
        )
      }
    }
    return new TransactionAdvantageRepartition(advantageRepartition)
  }

  expire(): Result<true, TransactionAlreadyExpiredError> {
    if (this.isExpired) {
      return Result.err(new TransactionAlreadyExpiredError())
    } else {
      this.props.expiredAt = new DateVO(new Date())
      return Result.ok(true)
    }
  }

  activatePhysicalCard(): Result<true, TransactionAlreadyExpiredError> {
    this.addEvent(
      new TransactionActivatePhysicalCardDomainEvent({
        aggregateId: this.id.value,
        employeeId: this.props.employeeId!.value,
      }),
    )
    return Result.ok(true)
  }

  validate(): void {
    if (
      this.props.amount > 0 &&
      (this.props.status === TransactionStatus.Accepted ||
        this.props.status === TransactionStatus.Cleared ||
        this.props.status === TransactionStatus.Reversed)
    ) {
      throw new ArgumentOutOfRangeException(
        'Accepted, Cleared and Reversed transaction amount cannot be more than 0',
      )
    }
    if (
      this.props.amount < 0 &&
      this.props.status === TransactionStatus.Refunded
    ) {
      throw new ArgumentOutOfRangeException(
        'Refunded transaction amount cannot be less than 0',
      )
    }
    if (
      this.props.expiredAt &&
      this.props.status !== TransactionStatus.Accepted
    ) {
      throw new ArgumentOutOfRangeException(
        'ExpiredAt is only for accepted transactions',
      )
    }
    if (
      !TransactionAdvantageRepartition.isRepartitionCorrect(
        this.props.amount,
        this.props.advantageRepartition,
      )
    ) {
      throw new ArgumentInvalidException(
        'Repartition not equal to amount of transaction',
      )
    }
  }
}
