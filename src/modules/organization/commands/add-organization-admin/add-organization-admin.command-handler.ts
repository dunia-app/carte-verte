import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { createOrganizationAdmin } from '../create-organization-admin/create-organization-admin.service'
import { AddOrganizationAdminCommand } from './add-organization-admin.command'

@CommandHandler(AddOrganizationAdminCommand)
export class AddOrganizationAdminCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: AddOrganizationAdminCommand) {
    return createOrganizationAdmin(this.unitOfWork, {
      correlationId: command.correlationId,
      email: command.email,
      firstname: command.firstname,
      lastname: command.lastname,
      organizationId: command.organizationId,
      sendCreationEvent: command.sendCreationEvent,
    })
  }
}
