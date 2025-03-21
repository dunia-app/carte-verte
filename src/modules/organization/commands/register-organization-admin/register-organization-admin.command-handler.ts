import { CommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { RegisterOrganizationAdminCommand } from './register-organization-admin.command'
import { registerOrganizationAdmin } from './register-organization-admin.service'

@CommandHandler(RegisterOrganizationAdminCommand)
export class RegisterOrganizationAdminCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly configService: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(command: RegisterOrganizationAdminCommand) {
    return registerOrganizationAdmin(
      command,
      this.unitOfWork,
      this.configService,
    )
  }
}
