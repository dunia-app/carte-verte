import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { OrganizationName } from '../../../../libs/ddd/domain/value-objects/name.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { OrganizationRepositoryPort } from '../../database/organization/organization.repository.port'
import { OrganizationEntity } from '../../domain/entities/organization.entity'
import { OrganizationOffer } from '../../domain/value-objects/organization-offer.value-object'
import { OrganizationAlreadyExistsError } from '../../errors/organization.errors'
import { CreateOrganizationCommand } from './create-organization.command'

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: CreateOrganizationCommand,
  ): Promise<Result<UUID, OrganizationAlreadyExistsError>> {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const organizationRepo: OrganizationRepositoryPort =
      this.unitOfWork.getOrganizationRepository(command.correlationId)
    // Organization uniqueness guard
    if (await organizationRepo.exists(command.name)) {
      /** Returning an Error instead of throwing it
       *  so a controller can handle it explicitly */
      return Result.err(new OrganizationAlreadyExistsError())
    }

    const organization = OrganizationEntity.create({
      name: new OrganizationName(command.name),
      offer: new OrganizationOffer({
        commission: command.commission,
        commissionType: command.commissionType,
        advantageInShops: command.advantageInShops,
        physicalCardPrice: command.physicalCardPrice,
        firstPhysicalCardPrice: command.firstPhysicalCardPrice
      }),
    })

    const created = await organizationRepo.save(organization)
    return Result.ok(created.id)
  }
}
