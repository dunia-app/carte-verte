import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { MerchantMerchantOrganizationOrmEntity } from '../../database/merchant-merchant-organization/merchant-merchant-organization.orm-entity'
import { MerchantMerchantOrganizationRepository } from '../../database/merchant-merchant-organization/merchant-merchant-organization.repository'
import {
  MerchantMerchantOrganizationEntity,
  MerchantMerchantOrganizationProps,
} from './merchant-merchant-organization.entity'

interface MerchantMerchantOrganizationFactoryProps {
  mid?: string
  merchantName?: string
  siret?: string
}

export class MerchantMerchantOrganizationFactory extends BaseFactory<
  MerchantMerchantOrganizationEntity,
  MerchantMerchantOrganizationFactoryProps,
  MerchantMerchantOrganizationRepository,
  MerchantMerchantOrganizationOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(MerchantMerchantOrganizationRepository)
  }

  protected buildEntity(defaultData: MerchantMerchantOrganizationFactoryProps) {
    const props: MerchantMerchantOrganizationProps = {
      mid: faker.string.numeric(8),
      merchantName: faker.company.name(),
      siret: faker.string.numeric(14),
      ...defaultData,
    }
    return new MerchantMerchantOrganizationEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
