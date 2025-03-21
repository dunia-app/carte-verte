import { CommandHandler } from '@nestjs/cqrs'
import { DataSource } from 'typeorm'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { FindPlaceService } from '../../../../infrastructure/place-autocomplete/find-place/find-place.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { InsertMerchantWithSiretCommand } from './insert-merchant-with-siret.command'
import { insertMerchantWithSiret } from './insert-merchant-with-siret.service'

@CommandHandler(InsertMerchantWithSiretCommand)
export class InsertMerchantWithSiretCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly findPlace: FindPlaceService,
    private readonly dataSource: DataSource,
  ) {
    super(unitOfWork)
  }

  async handle(command: InsertMerchantWithSiretCommand) {
    return insertMerchantWithSiret(
      command,
      this.unitOfWork,
      this.findPlace,
      this.dataSource,
    )
  }
}
