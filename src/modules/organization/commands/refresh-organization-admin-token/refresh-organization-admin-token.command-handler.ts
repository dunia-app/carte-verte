import { CommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { RefreshOrganizationAdminTokenCommand } from './refresh-organization-admin-token.command'
import { refreshOrganizationAdminToken } from './refresh-organization-admin-token.service'

@CommandHandler(RefreshOrganizationAdminTokenCommand)
export class RefreshOrganizationAdminTokenCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly config: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(command: RefreshOrganizationAdminTokenCommand) {
    return refreshOrganizationAdminToken(command, this.unitOfWork, this.config)
  }
}
