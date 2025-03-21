import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { TransferSource } from '../../../transaction/domain/entities/transfer.types'
import { TransferCreatedDomainEvent } from '../../../transaction/domain/events/transfer-created.domain-event'
import { sendCashbackNotif } from '../../commands/send-cashback-notif/send-cashback-notif.message.service'

export class SendCashbackNotifWhenCashbackTransferIsCreatedDomainEventHandler extends DomainEventHandler {
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(TransferCreatedDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: TransferCreatedDomainEvent[]): Promise<void> {
    for (const event of events) {
      if (event.source === TransferSource.CASHBACK) {
        return sendCashbackNotif(event, this.unitOfWork)
      }
    }
  }
}
