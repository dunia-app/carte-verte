import { CommandHandler } from '@nestjs/cqrs'
import { DataSource } from 'typeorm'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UpsertMerchantCommand } from './upsert-merchant.command'
import { UpsertMerchantService } from './upsert-merchant.service'

@CommandHandler(UpsertMerchantCommand)
export class UpsertMerchantCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly dataSource: DataSource,
  ) {
    super(unitOfWork)
  }

  async handle(command: UpsertMerchantCommand) {
    const upsertMerchantService = new UpsertMerchantService(this.unitOfWork, command, this.dataSource);
    return upsertMerchantService.upsertMerchant();
  }
}
