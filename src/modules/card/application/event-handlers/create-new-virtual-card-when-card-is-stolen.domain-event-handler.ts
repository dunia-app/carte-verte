import { logger } from '../../../../helpers/application.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { EmployeeRepository } from '../../../organization/database/employee/employee.repository'
import { CreateVirtualCardCommand } from '../../commands/create-virtual-card/create-virtual-card.command'
import { createVirtualCard } from '../../commands/create-virtual-card/create-virtual-card.service'
import { CardRepository } from '../../database/card/card.repository'
import { StolenCardBlockedDomainEvent } from '../../domain/events/stolen-card-blocked.domain-event'

export class CreateNewVirtualCardWhenCardIsStolenDomainEventHandler extends DomainEventHandler {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly employeeRepo: EmployeeRepository,
    private readonly cardRepo: CardRepository,
    private readonly baas: Baas,
  ) {
    super(StolenCardBlockedDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: StolenCardBlockedDomainEvent[]): Promise<void> {
    for (const event of events) {
      try {
        const [oldCard, employee] = await Promise.all([
          this.cardRepo.findOneByIdOrThrow(event.aggregateId),
          this.employeeRepo.findOneByIdOrThrow(event.employeeId),
        ])
        const input = new CreateVirtualCardCommand({
          correlationId: event.correlationId,
          causationId: event.id,
          employeeId: event.employeeId,
          externalEmployeeId: employee.externalEmployeeId!,
          design: oldCard.design,
        })
        await createVirtualCard(input, this.unitOfWork, this.baas)
      } catch (e) {
        logger.info(`[${this.constructor.name}]:error : ${e}`)
      }
    }
  }
}
