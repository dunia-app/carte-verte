import { CommandHandler, QueryBus } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { CardRepository } from '../../../card/database/card/card.repository'
import { AdvantageRepository } from '../../../merchant/database/advantage/advantage.repository'
import { EmployeeRepository } from '../../../organization/database/employee/employee.repository'
import { CardAcquisitionRepository } from '../../database/card-acquisition/card-acquisition.repository'
import { ExternalValidationRepository } from '../../database/external-validation/external-validation.repository'
import { WalletRepository } from '../../database/wallet/wallet.repository'
import { ExternalValidationResponseCode } from '../../domain/entities/external-validation.types'
import { AcceptTransactionCommand } from './accept-transaction.command'
import { acceptTransaction } from './accept-transaction.service'

// Do not forget !
// Daily Limit are set in Baas card for the moment !

@CommandHandler(AcceptTransactionCommand)
export class AcceptTansactionCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    protected readonly redis: RedisService,
    private readonly walletRepo: WalletRepository,
    private readonly employeeRepo: EmployeeRepository,
    private readonly cardRepo: CardRepository,
    private readonly externalValidationRepo: ExternalValidationRepository,
    private readonly advantageRepo: AdvantageRepository,
    private readonly cardAcquisitionRepo: CardAcquisitionRepository,
    private readonly queryBus: QueryBus,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: AcceptTransactionCommand,
  ): Promise<Result<ExternalValidationResponseCode, ExceptionBase>> {
    return acceptTransaction(
      command,
      this.walletRepo,
      this.employeeRepo,
      this.cardRepo,
      this.externalValidationRepo,
      this.advantageRepo,
      this.cardAcquisitionRepo,
      this.queryBus,
    )
  }
}
