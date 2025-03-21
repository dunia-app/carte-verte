import { logger } from '../../../../helpers/application.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { TransactionCreatedDomainEvent } from '../../../transaction/domain/events/transaction-created.domain-event'
import { sendTransactionNotif } from '../../commands/send-transaction-notif/send-transaction-notif.message.service'

export class SendTransactionNotifWhenTransactionIsCreatedDomainEventHandler extends DomainEventHandler {
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(TransactionCreatedDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: TransactionCreatedDomainEvent[]): Promise<void> {
    for (const event of events) {
      try {
        await sendTransactionNotif(event, this.unitOfWork)
      } catch (e) {
        // We catch any error so that sending the notif error cannot interfere with transaction handling
        logger.info(`[${this.constructor.name}]:error : ${e}`)
      }
    }
  }
}
