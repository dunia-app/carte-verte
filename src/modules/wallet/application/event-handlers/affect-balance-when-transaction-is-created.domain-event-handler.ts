import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { TransactionCreatedDomainEvent } from '../../../transaction/domain/events/transaction-created.domain-event'
import { AffectBalanceTransactionCommand } from '../../commands/affect-balance-transaction/affect-balance-transaction.command'
import { affectBalanceTransaction } from '../../commands/affect-balance-transaction/affect-balance-transaction.service'

export class AffectBalanceWhenTransactionIsCreatedDomainEventHandler extends DomainEventHandler {
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(TransactionCreatedDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: TransactionCreatedDomainEvent[]): Promise<void> {
    for (const event of events) {
      const input = new AffectBalanceTransactionCommand({
        correlationId: event.correlationId,
        causationId: event.id,
        employeeId: event.employeeId,
        amount: event.amount,
        transactionStatus: event.transactionStatus,
        transactionId: event.aggregateId,
        externalPaymentId: event.externalPaymentId,
        advantageRepartition: event.advantageRepartition,
        preAuthorizationAmount: event.preAuthorizationAmount,
        cashbackAmount: event.cashbackAmount,
      })

      await affectBalanceTransaction(input, this.unitOfWork)
    }
  }
}
