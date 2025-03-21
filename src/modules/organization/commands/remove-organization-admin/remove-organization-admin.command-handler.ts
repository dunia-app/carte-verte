import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { OrganizationAdminIsTheLastOneError } from '../../errors/organization-admin.errors'
import { RemoveOrganizationAdminCommand } from './remove-organization-admin.command'

@CommandHandler(RemoveOrganizationAdminCommand)
export class RemoveOrganizationAdminCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: RemoveOrganizationAdminCommand,
  ): Promise<Result<string, OrganizationAdminIsTheLastOneError>> {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const organizationAdminRepo =
      this.unitOfWork.getOrganizationAdminRepository(command.correlationId)

    const [organizationAdmin, organizationAdminCount] = await Promise.all([
      organizationAdminRepo.findOneByIdOrThrow(command.organizationAdminId, [
        'organizations',
      ]),
      organizationAdminRepo.adminOrganizationIdCount(command.organizationId),
    ])

    if (
      !organizationAdmin.isOrganizationAccessible(
        new UUID(command.organizationId),
      )
    ) {
      throw new NotFoundException('OrganizationAdmin not found')
    }
    if (organizationAdminCount === 1) {
      return Result.err(new OrganizationAdminIsTheLastOneError())
    }

    if (organizationAdmin.organizationsIds.length > 1) {
      organizationAdmin.removeOrganization(new UUID(command.organizationId))
      const removed = await organizationAdminRepo.save(organizationAdmin)
      return Result.ok(removed.id.value)
    }

    const removed = await organizationAdminRepo.delete([organizationAdmin])
    return Result.ok(removed[0].id.value)
  }
}
