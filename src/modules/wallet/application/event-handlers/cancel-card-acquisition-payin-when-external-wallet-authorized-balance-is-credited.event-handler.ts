import { logger } from '../../../../helpers/application.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events'
import { CancelCardAcquisitionPayinCommand } from '../../commands/cancel-card-acquisition-payin/cancel-card-acquisition-payin.command'
import { cancelCardAcquisitionPayin } from '../../commands/cancel-card-acquisition-payin/cancel-card-acquisition-payin.service'
import { ExternalWalletCreditAuthorizedBalanceDomainEvent } from '../../domain/events/external-wallet-credit-authorized-balance.domain-event'

export class CancelCardAcquisitionPayinWhenExternalWalletBalanceIsCreditedDomainEventHandler extends DomainEventHandler {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
    private readonly cardAcquisitionService: CardAcquisitionService,
  ) {
    super(ExternalWalletCreditAuthorizedBalanceDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(
    events: ExternalWalletCreditAuthorizedBalanceDomainEvent[],
  ): Promise<void> {
    for (const event of events) {
      try {
        const input = new CancelCardAcquisitionPayinCommand({
          correlationId: event.correlationId,
          causationId: event.id,
          employeeId: event.employeeId,
          transactionExternalPaymentId: event.transactionExternalPaymentId,
        })
        await cancelCardAcquisitionPayin(
          input,
          this.unitOfWork,
          this.baas,
          this.cardAcquisitionService,
        )
      } catch (e) {
        logger.info(
          `\[${this.constructor.name}]:transactionId: ${event.aggregateId} : error : ${e}`,
        )
      }
    }
  }
}
