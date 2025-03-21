import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UpdateMerchantMccCommand } from './update-merchant-mcc.command'
import { updateMerchantMcc } from './update-merchant-mcc.service'

@CommandHandler(UpdateMerchantMccCommand)
export class UpdateMerchantMccCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: UpdateMerchantMccCommand) {
    return updateMerchantMcc(command, this.unitOfWork)
  }
}
