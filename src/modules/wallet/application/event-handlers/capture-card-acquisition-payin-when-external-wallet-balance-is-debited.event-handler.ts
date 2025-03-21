import { logger } from '../../../../helpers/application.helper'
import { toScale } from '../../../../helpers/math.helper'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { UnfreezeEmployeeCommand } from '../../../organization/commands/unfreeze-employee/unfreeze-employee.command'
import { unfreezeEmployee } from '../../../organization/commands/unfreeze-employee/unfreeze-employee.service'
import { CaptureCardAcquisitionPayinCommand } from '../../commands/capture-card-acquisition-payin/capture-card-acquisition-payin.command'
import { captureCardAcquisitionPayin } from '../../commands/capture-card-acquisition-payin/capture-card-acquisition-payin.service'
import { CardAcquisitionPayinStatus } from '../../domain/entities/card-acquisition-payin.types'
import { ExternalWalletDebitBalanceDomainEvent } from '../../domain/events/external-wallet-debit-balance.domain-event'

export class CaptureCardAcquisitionPayinWhenExternalWalletBalanceIsDebitedDomainEventHandler extends DomainEventHandler {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
    private readonly cardAcquisitionService: CardAcquisitionService,
  ) {
    super(ExternalWalletDebitBalanceDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: ExternalWalletDebitBalanceDomainEvent[]): Promise<void> {
    for (const event of events) {
      const input = new CaptureCardAcquisitionPayinCommand({
        correlationId: event.correlationId,
        causationId: event.id,
        employeeId: event.employeeId,
        // We capture the negative amount because transaction amount is negative
        // we also need to substract cashback amount to the amount
        amount: toScale(
          -Number(event.amount) - Number(event.cashbackAmount),
          2,
        ),
        transactionExternalPaymentId: event.transactionExternalPaymentId,
      })
      if (input.amount <= 0) {
        continue
      }
      try {
        const res = await captureCardAcquisitionPayin(
          input,
          this.unitOfWork,
          this.baas,
          this.cardAcquisitionService,
        )

        if (res.isOk && res.value !== CardAcquisitionPayinStatus.Failed) {
          try {
            // If employee is frozen and had no transaction to pay left we unfreeze it automatically
            const employee = await this.unitOfWork
              .getEmployeeRepository(input.correlationId)
              .findOneByIdOrThrow(event.employeeId)
            if (employee.isFrozen) {
              const hasTransactionsUnpaid = await this.unitOfWork
                .getTransactionRepository(input.correlationId)
                .employeeHasTransactionWithoutSucessfullPayin(event.employeeId)
              if (hasTransactionsUnpaid) {
                await unfreezeEmployee(
                  new UnfreezeEmployeeCommand({
                    correlationId: event.correlationId,
                    causationId: event.id,
                    employeeId: event.employeeId,
                  }),
                  this.unitOfWork,
                  this.baas,
                )
              }
            }
          } catch (e) {
            logger.info(
              `\[${this.constructor.name}]:walletId: ${event.aggregateId} : error while unfreezing : ${e}`,
            )
          }
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

      // If we cannot capture the payin, we need to freeze the employee
      // await freezeEmployee(
      //   new FreezeEmployeeCommand({
      //     correlationId: event.correlationId,
      //     causationId: event.id,
      //     employeeId: event.employeeId,
      //   }),
      //   this.unitOfWork,
      //   this.baas,
      // )
    }
  }
}
