import { logger } from '../../../../helpers/application.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { EmployeeUnfrozenDomainEvent } from '../../../organization/domain/events/employee-unfrozen.domain-event'
import { sendEmployeeUnfrozenNotif } from '../../commands/send-employee-unfrozen-notif/send-employee-unfrozen-notif.message.service'

export class SendEmployeeUnfrozenNotifWhenEmployeeIsUnfrozenDomainEventHandler extends DomainEventHandler {
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(EmployeeUnfrozenDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: EmployeeUnfrozenDomainEvent[]): Promise<void> {
    for (const event of events) {
      try {
        await sendEmployeeUnfrozenNotif(event, this.unitOfWork)
      } catch (e) {
        // We catch any error so that sending the notif error cannot interfere with EmployeeUnfrozen handling
        logger.info(`[${this.constructor.name}]:error : ${e}`)
      }
    }
  }
}
