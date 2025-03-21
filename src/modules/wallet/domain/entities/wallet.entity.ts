import { NotImplementedException } from '@nestjs/common'
import { logger } from '../../../../helpers/application.helper'
import { toScale } from '../../../../helpers/math.helper'
import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { TransactionStatus } from '../../../transaction/domain/entities/transaction.types'
import { TransferDirection } from '../../../transaction/domain/entities/transfer.types'
import { ExternalWalletCreditAuthorizedBalanceDomainEvent } from '../events/external-wallet-credit-authorized-balance.domain-event'
import { ExternalWalletDebitAuthorizedBalanceDomainEvent } from '../events/external-wallet-debit-authorized-balance.domain-event'
import { ExternalWalletDebitBalanceDomainEvent } from '../events/external-wallet-debit-balance.domain-event'
import { WalletCreatedDomainEvent } from '../events/wallet-created.domain-event'
import { Balance } from '../value-objects/balance.value-object'

export interface CreateWalletProps {
  employeeId: UUID
  name: string
  advantage: AdvantageType
}

export interface WalletProps extends CreateWalletProps {
  balance: Balance
  authorizedBalance: Balance
}

export class WalletEntity extends AggregateRoot<WalletProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateWalletProps): WalletEntity {
    const id = UUID.generate()
    const props: WalletProps = {
      ...create,
      balance: new Balance(0),
      authorizedBalance: new Balance(0),
    }
    const wallet = new WalletEntity({ id, props })

    wallet.addEvent(
      new WalletCreatedDomainEvent({
        aggregateId: id.value,
        employeeId: props.employeeId.value,
        name: props.name,
      }),
    )
    return wallet
  }

  get employeeId(): string {
    return this.props.employeeId.value
  }

  get advantage(): AdvantageType {
    return this.props.advantage
  }

  get balance(): number {
    return this.props.balance.value
  }

  get authorizedBalance(): number {
    return this.props.authorizedBalance.value
  }

  get hasBeenCreditedOnce(): boolean {
    return this.updatedAt.value.getTime() !== this.createdAt.value.getTime()
  }

  affectBalanceTransaction(
    amount: number,
    transactionStatus: TransactionStatus,
    transactionExternalPaymentId: string,
    declinedBeforeAccepted: boolean = false,
    declinedAfterAccepted: boolean = false,
    directSettlement: boolean = false,
    preAuthorizationAmount?: number,
    cashbackAmount?: number,
  ): boolean {
    const castedAmount = Number(amount)
    switch (transactionStatus) {
      case TransactionStatus.Accepted:
        if (declinedBeforeAccepted) {
          return false
        } else {
          if (this.advantage === AdvantageType.EXTERNAL) {
            this.addEvent(
              new ExternalWalletDebitAuthorizedBalanceDomainEvent({
                aggregateId: this.id.value,
                employeeId: this.employeeId,
                amount: castedAmount,
                cashbackAmount: cashbackAmount || 0,
                transactionExternalPaymentId: transactionExternalPaymentId,
              }),
            )
          }
          return this.debitAuthorizedBalance(castedAmount)
        }
      case TransactionStatus.Reversed:
        if (this.advantage === AdvantageType.EXTERNAL) {
          this.addEvent(
            new ExternalWalletCreditAuthorizedBalanceDomainEvent({
              aggregateId: this.id.value,
              employeeId: this.employeeId,
              amount: -castedAmount,
              transactionExternalPaymentId: transactionExternalPaymentId,
            }),
          )
        }
        // Reversed transaction are negative even though they credit wallet so we invert them
        return this.creditAuthorizedBalance(-castedAmount)
      case TransactionStatus.Settled:
        if (castedAmount > 0) {
          // If we settle a refund we need to refund authorizedBalance as well
          this.creditAuthorizedBalance(castedAmount)
          return this.creditBalance(castedAmount)
        } else {
          // Pre authorization settled need to update authorizedBalance as well
          if (preAuthorizationAmount) {
            const differencePreAuthorizationSettled =
              castedAmount - preAuthorizationAmount
            this.debitAuthorizedBalance(differencePreAuthorizationSettled)
          }
          if (directSettlement) {
            this.debitAuthorizedBalance(castedAmount)
          }
          if (this.advantage === AdvantageType.EXTERNAL) {
            this.addEvent(
              new ExternalWalletDebitBalanceDomainEvent({
                aggregateId: this.id.value,
                employeeId: this.employeeId,
                amount: castedAmount,
                cashbackAmount: cashbackAmount || 0,
                transactionExternalPaymentId: transactionExternalPaymentId,
              }),
            )
          }
          return this.debitBalance(castedAmount)
        }
      case TransactionStatus.Declined:
        if (declinedAfterAccepted) {
          if (this.advantage === AdvantageType.EXTERNAL) {
            this.addEvent(
              new ExternalWalletCreditAuthorizedBalanceDomainEvent({
                aggregateId: this.id.value,
                employeeId: this.employeeId,
                amount: castedAmount,
                transactionExternalPaymentId: transactionExternalPaymentId,
              }),
            )
          }
          // Declined transaction that have been accepted previously must credit back authorizedBalance
          return this.creditAuthorizedBalance(-castedAmount)
        } else {
          return false
        }
      default:
        // Do nothing and return -1 to signify that we don't need to save entity
        return false
    }
  }

  affectBalanceTransfer(amount: number, direction: TransferDirection): boolean {
    const castedAmount = Number(amount)
    switch (direction) {
      case TransferDirection.CREDIT:
        this.creditAuthorizedBalance(castedAmount)
        return this.creditBalance(castedAmount)
      case TransferDirection.DEBIT:
        this.debitAuthorizedBalance(-castedAmount)
        return this.debitBalance(-castedAmount)
      default:
        throw new NotImplementedException()
    }
  }

  private creditBalance(amount: number): boolean {
    this.props.balance = new Balance(this.props.balance.value + amount)
    return amount != 0
  }

  private creditAuthorizedBalance(amount: number): boolean {
    this.props.authorizedBalance = new Balance(this.authorizedBalance + amount)
    return amount != 0
  }

  private debitBalance(amount: number): boolean {
    // amount is negative for debit
    if (this.props.balance.value + amount < 0) {
      logger.error(
        `[${this.constructor.name}]: WalletId ${this.id.value} has not enough balance for debit`,
      )
    }
    this.props.balance = new Balance(this.props.balance.value + amount)
    return amount != 0
  }

  private debitAuthorizedBalance(amount: number): boolean {
    // amount is negative for debit
    if (this.authorizedBalance + amount < 0) {
      logger.error(
        `[${this.constructor.name}]: WalletId ${this.id.value} has not enough authorized balance for debit`,
      )
    }
    this.props.authorizedBalance = new Balance(this.authorizedBalance + amount)
    return amount != 0
  }

  static isAmountDebitable(
    amount: number,
    wallets: WalletEntity[],
    externalLimit: number = 0,
  ): boolean {
    const authorizedBalanceSum = toScale(
      wallets.reduce((a, b) => a + b.authorizedBalance, 0),
      2,
    )
    // We check if the amount of balance + external is enough for the amount
    return authorizedBalanceSum + externalLimit - amount >= 0
  }

  public validate(): void {
    if (this.props.balance.value < this.authorizedBalance) {
      logger.error(
        `[${this.constructor.name}]: WalletId ${this.id.value} : Wallet balance cannot be less than authorizedBalance`,
      )
    }
  }
}
