import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { DistributeRetroactiveCashbackCommand } from './distribute-retroactive-cashback.command'
import { distributeRetroactiveCashback } from './distribute-retroactive-cashback.service'

@CommandHandler(DistributeRetroactiveCashbackCommand)
export class DistributeRetroactiveCashbackCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: DistributeRetroactiveCashbackCommand) {
    return distributeRetroactiveCashback(command, this.unitOfWork)
  }
}
