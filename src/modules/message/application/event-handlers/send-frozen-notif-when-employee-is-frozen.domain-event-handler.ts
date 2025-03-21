import { logger } from '../../../../helpers/application.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { EmployeeFrozenDomainEvent } from '../../../organization/domain/events/employee-frozen.domain-event'
import { sendEmployeeFrozenNotif } from '../../commands/send-employee-frozen-notif/send-employee-frozen-notif.message.service'

export class SendEmployeeFrozenNotifWhenEmployeeIsFrozenDomainEventHandler extends DomainEventHandler {
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(EmployeeFrozenDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: EmployeeFrozenDomainEvent[]): Promise<void> {
    for (const event of events) {
      try {
        await sendEmployeeFrozenNotif(event, this.unitOfWork)
      } catch (e) {
        // We catch any error so that sending the notif error cannot interfere with EmployeeFrozen handling
        logger.info(`[${this.constructor.name}]:error : ${e}`)
      }
    }
  }
}
