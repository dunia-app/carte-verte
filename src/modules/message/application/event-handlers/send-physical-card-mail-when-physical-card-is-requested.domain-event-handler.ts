import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { PhysicalCardRequestedDomainEvent } from '../../../card/domain/events/physical-card-requested.domain-event'
import { sendPhysicalCardMail } from '../../commands/send-physical-card-mail/send-physical-card-mail.message.service'

export class SendPhysicalCardMailWhenPhysicalCardIsRequestedDomainEventHandler extends DomainEventHandler {
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(PhysicalCardRequestedDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: PhysicalCardRequestedDomainEvent[]): Promise<void> {
    for (const event of events) {
      await sendPhysicalCardMail(this.unitOfWork, event)
    }
  }
}
