import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { MerchantOrganizationOrmEntity } from '../../database/merchant-organization/merchant-organization.orm-entity'
import { MerchantOrganizationRepository } from '../../database/merchant-organization/merchant-organization.repository'
import {
  MerchantOrganizationEntity,
  MerchantOrganizationProps,
} from './merchant-organization.entity'

interface MerchantOrganizationFactoryProps {
  siret?: string
  cntrRegistrationNumber?: string | null
  brandName?: string
  organizationName?: string
  naf?: string
  address?: Address
  unactivatedAt?: DateVO
}

export class MerchantOrganizationFactory extends BaseFactory<
  MerchantOrganizationEntity,
  MerchantOrganizationFactoryProps,
  MerchantOrganizationRepository,
  MerchantOrganizationOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(MerchantOrganizationRepository)
  }

  protected buildEntity(defaultData: MerchantOrganizationFactoryProps) {
    const props: MerchantOrganizationProps = {
      siret: faker.string.numeric(14),
      cntrRegistrationNumber: faker.string.numeric(10),
      brandName: faker.company.name(),
      organizationName: faker.company.name(),
      naf: faker.string.alphanumeric(4),
      imageLinks: [],
      address: new Address({
        city: faker.location.city(),
        postalCode: faker.location.zipCode(),
        street: faker.location.street(),
      }),
      affiliationInvitationSent: 0,
      ...defaultData,
    }
    return new MerchantOrganizationEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
