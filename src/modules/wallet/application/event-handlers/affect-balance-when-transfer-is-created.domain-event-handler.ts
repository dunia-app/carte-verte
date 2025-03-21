import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events'
import { TransferSource } from '../../../transaction/domain/entities/transfer.types'
import { TransferCreatedDomainEvent } from '../../../transaction/domain/events/transfer-created.domain-event'
import { AffectBalanceTransferCommand } from '../../commands/affect-balance-transfer/affect-balance-transfer.command'
import { affectBalanceTransfer } from '../../commands/affect-balance-transfer/affect-balance-transfer.service'

export class AffectBalanceWhenTransferIsCreatedDomainEventHandler extends DomainEventHandler {
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(TransferCreatedDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: TransferCreatedDomainEvent[]): Promise<void> {
    for (const event of events) {
      // CASHBACK is not distributed but substracted to the external payin amount
      if (event.source === TransferSource.CASHBACK) {
        return
      }
      const input = new AffectBalanceTransferCommand({
        correlationId: event.correlationId,
        causationId: event.id,
        walletId: event.walletId,
        amount: event.amount,
        transferDirection: event.direction,
      })

      await affectBalanceTransfer(input, this.unitOfWork)
    }
  }
}
