import { logger } from '../../../../helpers/application.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { CardPinChangedDomainEvent } from '../../../card/domain/events/card-pin-changed.domain-event'
import { SendPinChangedNotifCommand } from '../../commands/send-pin-changed-notif/send-pin-changed-notif.command'
import { sendPinChangedNotif } from '../../commands/send-pin-changed-notif/send-pin-changed-notif.message.service'

export class SendPinChangedNotifWhenCardPinHasChangedDomainEventHandler extends DomainEventHandler {
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(CardPinChangedDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: CardPinChangedDomainEvent[]): Promise<void> {
    for (const event of events) {
      const input = new SendPinChangedNotifCommand({
        correlationId: event.correlationId,
        causationId: event.id,
        employeeId: event.employeeId,
      })
      try {
        await sendPinChangedNotif(input, this.unitOfWork)
      } catch (e) {
        logger.info(`\[${this.constructor.name}]:error : ${e}`)
      }
    }
  }
}
