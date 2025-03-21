import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { OrganizationName } from '../../../../libs/ddd/domain/value-objects/name.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { OrganizationOrmEntity } from '../../database/organization/organization.orm-entity'
import { OrganizationRepository } from '../../database/organization/organization.repository'
import {
  CommissionType,
  OrganizationOffer,
} from '../value-objects/organization-offer.value-object'
import { OrganizationSettings } from '../value-objects/organization-settings.value-object'
import { OrganizationEntity, OrganizationProps } from './organization.entity'

export interface OrganizationFactoryProps {
  settings?: OrganizationSettings
  hasAcceptedOffer?: boolean
  offer?: OrganizationOffer
}

export class OrganizationFactory extends BaseFactory<
  OrganizationEntity,
  OrganizationFactoryProps,
  OrganizationRepository,
  OrganizationOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(OrganizationRepository)
  }

  protected buildEntity(defaultData: OrganizationFactoryProps) {
    const props: OrganizationProps = {
      address: new Address({
        city: faker.location.city(),
        postalCode: faker.location.zipCode(),
        street: faker.location.street(),
      }),
      name: new OrganizationName(faker.company.name()),
      offer: new OrganizationOffer({
        advantageInShops: 5,
        commission: 5,
        commissionType: CommissionType.PERCENT,
        physicalCardPrice: 5,
        firstPhysicalCardPrice: 5
      }),
      siret: faker.string.numeric(14),
      hasAcceptedOffer: true,
      ...defaultData,
    }
    return new OrganizationEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
