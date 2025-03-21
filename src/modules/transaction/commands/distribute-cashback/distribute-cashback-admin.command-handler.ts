import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { DistributeCashbackAdminCommand } from './distribute-cashback-admin.command'
import { DistributeCashbackCommand } from './distribute-cashback.command'
import { distributeCashback } from './distribute-cashback.service'

@CommandHandler(DistributeCashbackAdminCommand)
export class DistributeCashbackAdminCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: DistributeCashbackAdminCommand,
  ): Promise<Result<number, NotFoundException>> {
    const transactionRepo = this.unitOfWork.getTransactionRepository(
      command.correlationId,
    )
    const walletRepo = this.unitOfWork.getWalletRepository(
      command.correlationId,
    )
    const transaction = await transactionRepo.findOneByIdOrThrow(
      command.transactionId,
    )
    if (transaction.cashbackId) {
      return Result.err(new NotFoundException('Cashback already distributed'))
    }
    const wallet = await walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
      transaction.employeeId!.value,
      AdvantageType.NONE,
    )
    const commandCashback = new DistributeCashbackCommand({
      correlationId: command.correlationId,
      walletId: wallet.id,
      employeeId: transaction.employeeId!.value,
      cashbackableAmount: transaction.cashbackableAmount,
      paymentDate: transaction.paymentDate.value,
      merchantName: transaction.merchantName,
      transactionStatus: transaction.status,
    })
    const res = await distributeCashback(commandCashback, this.unitOfWork)
    if (res.isOk && res.value && res.value.amount > 0) {
      transaction.cashback(res.value.id)
      await transactionRepo.save(transaction)
      return Result.ok(res.value.amount)
    }
    return Result.err(
      res.isOk ? new NotFoundException('No cashback to distribute') : res.error,
    )
  }
}
