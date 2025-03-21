import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { NameNotValideError } from '../../../../libs/ddd/domain/value-objects/name.error'
import { OrganizationName } from '../../../../libs/ddd/domain/value-objects/name.value-object'
import { OrganizationRepositoryPort } from '../../database/organization/organization.repository.port'
import { OrganizationEntity } from '../../domain/entities/organization.entity'
import { OrganizationOffer } from '../../domain/value-objects/organization-offer.value-object'
import { createOrganizationAdmin } from '../create-organization-admin/create-organization-admin.service'
import { CreateNewOrganizationAdminCommand } from './create-new-organization-admin.command'

@CommandHandler(CreateNewOrganizationAdminCommand)
export class CreateNewOrganizationAdminCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: CreateNewOrganizationAdminCommand,
  ): Promise<Result<OrganizationEntity, NameNotValideError>> {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const organizationRepo: OrganizationRepositoryPort =
      this.unitOfWork.getOrganizationRepository(command.correlationId)

    const offer = new OrganizationOffer({
      commission: command.commission,
      commissionType: command.commissionType,
      advantageInShops: command.advantageInShops,
      physicalCardPrice: command.physicalCardPrice,
      firstPhysicalCardPrice: command.firstPhysicalCardPrice,
    })

    const organization = OrganizationEntity.create({
      name: new OrganizationName(command.organizationName),
      offer: offer,
    })

    if (command?.physicalCardCoverage) {
      organization.setSettings(
        undefined,
        undefined,
        undefined,
        undefined,
        command.physicalCardCoverage,
      )
    }
    if (command?.firstPhysicalCardCoverage) {
      organization.setSettings(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        command.firstPhysicalCardCoverage,
      )
    }
    const res = await organizationRepo.save(organization)

    const adminRes = await createOrganizationAdmin(this.unitOfWork, {
      correlationId: command.correlationId,
      email: command.email,
      firstname: command.firstname,
      lastname: command.lastname,
      organizationId: organization.id.value,
    })

    if (adminRes.isErr) {
      return Result.err(adminRes.error)
    }
    return Result.ok(res)
  }
}
