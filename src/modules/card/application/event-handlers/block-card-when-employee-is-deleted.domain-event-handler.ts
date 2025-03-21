import { logger } from '../../../../helpers/application.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { EmployeeDeletedDomainEvent } from '../../../organization/domain/events/employee-deleted.domain-event'
import { BlockDestroyedCardCommand } from '../../commands/block-destroyed-card/block-destroyed-card.command'

export class BlockDestroyedCardWhenEmployeeIsDeletedDomainEventHandler extends DomainEventHandler {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(EmployeeDeletedDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: EmployeeDeletedDomainEvent[]): Promise<void> {
    for (const event of events) {
      const input = new BlockDestroyedCardCommand({
        correlationId: event.correlationId,
        causationId: event.id,
        employeeId: event.aggregateId,
      })
      try {
        // await blockDestroyedCard(input, this.unitOfWork, this.baas)
      } catch (e) {
        logger.info(`[${this.constructor.name}]:error : ${e}`)
      }
    }
  }
}
