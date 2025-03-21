import { NotImplementedException } from '@nestjs/common'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { EmployeeCreatedDomainEvent } from '../../../organization/domain/events/employee-created.domain-event'
import { CreateWalletCommand } from '../../commands/create-wallet/create-wallet.command'
import { createWallet } from '../../commands/create-wallet/create-wallet.service'

export class CreateWalletWhenEmployeeIsCreatedDomainEventHandler extends DomainEventHandler {
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(EmployeeCreatedDomainEvent)
  }

  defaultWalletName = 'My Wallet'

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: EmployeeCreatedDomainEvent[]): Promise<void> {
    if (
      events.find(
        (event) =>
          event.correlationId != events[0].correlationId ||
          event.organizationId != events[0].organizationId,
      )
    ) {
      throw new NotImplementedException(
        'EmployeeCreatedDomainEvent need to be handled for one organization at a time',
      )
    }
    const command = new CreateWalletCommand({
      correlationId: events[0].correlationId,
      causationId: events[0].causationId,
      employeeIds: events.map((event) => event.aggregateId),
      name: this.defaultWalletName,
      organizationId: events[0].organizationId,
    })
    await createWallet(command, this.unitOfWork)
  }
}
