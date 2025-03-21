import { CommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UpdateOrgnanizationAdminPasswordCommand } from './update-organization-admin-password.command'
import { updateOrgnanizationAdminPassword } from './update-organization-admin-password.service'

@CommandHandler(UpdateOrgnanizationAdminPasswordCommand)
export class UpdateOrgnanizationAdminPasswordCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly configService: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(command: UpdateOrgnanizationAdminPasswordCommand) {
    return updateOrgnanizationAdminPassword(
      command,
      this.unitOfWork,
      this.configService,
    )
  }
}
