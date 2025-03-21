import { logger } from '../../../../helpers/application.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { TransactionActivatePhysicalCardDomainEvent } from '../../../transaction/domain/events/transaction-activate-physical-card.domain-event'
import { ActivatePhysicalCardCommand } from '../../commands/activate-physical-card/activate-physical-card.command'
import { activatePhysicalCard } from '../../commands/activate-physical-card/activate-physical-card.service'

export class ActivateCardWhenTransactionActivatePhysicalCardDomainEventHandler extends DomainEventHandler {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(TransactionActivatePhysicalCardDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(
    events: TransactionActivatePhysicalCardDomainEvent[],
  ): Promise<void> {
    for (const event of events) {
      const input = new ActivatePhysicalCardCommand({
        correlationId: event.correlationId,
        causationId: event.id,
        employeeId: event.employeeId,
      })
      try {
        await activatePhysicalCard(input, this.unitOfWork, this.baas)
      } catch (e) {
        logger.info(`[${this.constructor.name}]:error : ${e}`)
      }
    }
  }
}
