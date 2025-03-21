import { logger } from '../../../../helpers/application.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/domain-event-handler.base'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { TransferDirection } from '../../../transaction/domain/entities/transfer.types'
import { AffectBalanceTransferCommand } from '../../commands/affect-balance-transfer/affect-balance-transfer.command'
import { affectBalanceTransfer } from '../../commands/affect-balance-transfer/affect-balance-transfer.service'
import { CardAcquisitionPayinCapturedDomainEvent } from '../../domain/events/card-acquisition-payin-captured.domain-event'

export class AffectExternalBalanceWhenCardAcquisitionPayinIsCapturedDomainEventHandler extends DomainEventHandler {
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(CardAcquisitionPayinCapturedDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(
    events: CardAcquisitionPayinCapturedDomainEvent[],
  ): Promise<void> {
    for (const event of events) {
      const wallet = await this.unitOfWork
        .getWalletRepository(event.correlationId!)
        .findOneByEmployeeIdAndAdvantageOrThrow(
          event.employeeId,
          AdvantageType.EXTERNAL,
        )
      // To keep info of awaiting card acquisition payin we use the external wallet balance
      const input = new AffectBalanceTransferCommand({
        correlationId: event.correlationId,
        causationId: event.id,
        walletId: wallet.id.value,
        amount: event.amount,
        transferDirection: TransferDirection.CREDIT,
      })
      try {
        await affectBalanceTransfer(input, this.unitOfWork)
      } catch (e) {
        logger.info(`\[${this.constructor.name}]:error : ${e}`)
      }
    }
  }
}
