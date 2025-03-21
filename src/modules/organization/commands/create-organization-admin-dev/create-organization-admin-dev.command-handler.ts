import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { OrganizationName } from '../../../../libs/ddd/domain/value-objects/name.value-object'
import { OrganizationRepositoryPort } from '../../database/organization/organization.repository.port'
import {
  CreateOrganizationProps,
  OrganizationEntity,
} from '../../domain/entities/organization.entity'
import {
  CommissionType,
  OrganizationOffer,
} from '../../domain/value-objects/organization-offer.value-object'
import { OrganizationSettings } from '../../domain/value-objects/organization-settings.value-object'
import { OrganizationAdminAlreadyExistsError } from '../../errors/organization-admin.errors'
import { createOrganizationAdmin } from '../create-organization-admin/create-organization-admin.service'
import { CreateOrganizationAdminDevCommand } from './create-organization-admin-dev.command'

const defaultOrganizationProps: CreateOrganizationProps = {
  address: new Address({
    city: 'France',
    postalCode: '59000',
    street: "Rue d'euratech",
  }),
  name: new OrganizationName('Dunia test'),
  offer: new OrganizationOffer({
    commission: 5,
    commissionType: CommissionType.PERCENT,
    advantageInShops: 5,
    physicalCardPrice: 0,
    firstPhysicalCardPrice: 0
  }),
  settings: new OrganizationSettings({
    coveragePercent: 50,
    mealTicketAmount: 11.38,
    mealTicketDay: 1,
    mealTicketAutoRenew: false,
    physicalCardCoverage: 0,
    firstPhysicalCardCoverage: 0
  }),
}

@CommandHandler(CreateOrganizationAdminDevCommand)
export class CreateOrganizationAdminDevCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: CreateOrganizationAdminDevCommand,
  ): Promise<Result<string, OrganizationAdminAlreadyExistsError>> {
    const organizationRepo: OrganizationRepositoryPort =
      this.unitOfWork.getOrganizationRepository(command.correlationId)
    let organization = await organizationRepo.findOneByName(
      defaultOrganizationProps.name.value,
    )
    if (!organization) {
      organization = OrganizationEntity.create({
        name: new OrganizationName(defaultOrganizationProps.name.value),
        offer: defaultOrganizationProps.offer,
      })

      await organizationRepo.save(organization)
    }

    return createOrganizationAdmin(this.unitOfWork, {
      correlationId: command.correlationId,
      email: command.email,
      firstname: command.firstname,
      lastname: command.lastname,
      organizationId: organization.id.value,
    })
  }
}
