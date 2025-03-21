import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UpdateOrganizationAdminCommand } from './update-organization-admin.command'
import { updateOrganizationAdmin } from './update-organization-admin.service'

@CommandHandler(UpdateOrganizationAdminCommand)
export class UpdateOrganizationAdminCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: UpdateOrganizationAdminCommand) {
    return updateOrganizationAdmin(command, this.unitOfWork)
  }
}
