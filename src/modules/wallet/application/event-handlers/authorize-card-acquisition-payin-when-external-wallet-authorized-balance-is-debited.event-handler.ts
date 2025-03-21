import { logger } from '../../../../helpers/application.helper'
import { toScale } from '../../../../helpers/math.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/domain-event-handler.base'
import { FreezeEmployeeCommand } from '../../../organization/commands/freeze-employee/freeze-employee.command'
import { freezeEmployee } from '../../../organization/commands/freeze-employee/freeze-employee.service'
import { AuthorizeCardAcquisitionPayinCommand } from '../../commands/authorize-card-acquisition-payin/authorize-card-acquisition-payin.command'
import { authorizeCardAcquisitionPayin } from '../../commands/authorize-card-acquisition-payin/authorize-card-acquisition-payin.service'
import { CardAcquisitionPayinStatus } from '../../domain/entities/card-acquisition-payin.types'
import { ExternalWalletDebitAuthorizedBalanceDomainEvent } from '../../domain/events/external-wallet-debit-authorized-balance.domain-event'

export class AuthorizeCardAcquisitionPayinWhenExternalWalletAuthorizedBalanceIsDebitedDomainEventHandler extends DomainEventHandler {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly cardAcquisitionService: CardAcquisitionService,
    private readonly baas: Baas,
  ) {
    super(ExternalWalletDebitAuthorizedBalanceDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(
    events: ExternalWalletDebitAuthorizedBalanceDomainEvent[],
  ): Promise<void> {
    for (const event of events) {
      const input = new AuthorizeCardAcquisitionPayinCommand({
        correlationId: event.correlationId,
        causationId: event.id,
        employeeId: event.employeeId,
        transactionExternalPaymentId: event.transactionExternalPaymentId,
        // We capture the negative amount because transaction amount is negative
        // we also need to substract cashback amount to the amount
        amount: toScale(
          -Number(event.amount) - Number(event.cashbackAmount),
          2,
        ),
      })
      if (input.amount <= 0) {
        continue
      }
      try {
        const res = await authorizeCardAcquisitionPayin(
          input,
          this.unitOfWork,
          this.baas,
          this.cardAcquisitionService,
        )

        if (res.isOk && res.value !== CardAcquisitionPayinStatus.Failed) {
          continue
        }
      } catch (e) {
        logger.info(
          `\[${this.constructor.name}]:walletId: ${
            event.aggregateId
          } : input : ${JSON.stringify(input)}`,
        )
        logger.info(
          `\[${this.constructor.name}]:walletId: ${event.aggregateId} : error : ${e}`,
        )
      }

      // If we cannot authorize the payin, we need to freeze the employee
      await freezeEmployee(
        new FreezeEmployeeCommand({
          correlationId: event.correlationId,
          causationId: event.id,
          employeeId: event.employeeId,
        }),
        this.unitOfWork,
        this.baas,
      )
    }
  }
}
