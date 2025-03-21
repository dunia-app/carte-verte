import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { EmployeeCreatedDomainEvent } from '../../../organization/domain/events/employee-created.domain-event'

export class SendRegisterEmailWhenEmployeeIsCreatedDomainEventHandler extends DomainEventHandler {
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(EmployeeCreatedDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: EmployeeCreatedDomainEvent[]): Promise<void> {
    // if (
    //   events.find(
    //     (event) =>
    //       event.correlationId != events[0].correlationId ||
    //       event.organizationId != events[0].organizationId,
    //   )
    // ) {
    //   throw new NotImplementedException(
    //     'EmployeeCreatedDomainEvent need to be handled for one organization at a time',
    //   )
    // }
    // const command = new SendEmployeeRegisterEmailCommand({
    //   correlationId: events[0].correlationId,
    //   causationId: events[0].causationId,
    //   userIds: events.map((event) => event.userId),
    //   organizationId: events[0].organizationId,
    // })
    // return sendEmployeeRegisterEmail(this.unitOfWork, command)
  }
}
