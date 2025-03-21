import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { MerchantOrmEntity } from '../../database/merchant/merchant.orm-entity'
import { MerchantRepository } from '../../database/merchant/merchant.repository'
import { MerchantCategoryEntity } from './merchant-category.entity'
import { MerchantEntity, MerchantProps } from './merchant.entity'
import { AdvantageForm } from './merchant.types'

interface MerchantFactoryProps {
  merchantCategory: MerchantCategoryEntity
  mid?: string
  name?: string
  advantageForm?: AdvantageForm
  address?: Address
  isCashbackableSince?: DateVO
}

export class MerchantFactory extends BaseFactory<
  MerchantEntity,
  MerchantFactoryProps,
  MerchantRepository,
  MerchantOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(MerchantRepository)
  }

  protected buildEntity(defaultData: MerchantFactoryProps) {
    const props: MerchantProps = {
      mid: faker.string.numeric(10),
      name: faker.company.name(),
      imageLinks: [],
      isHidden: false,
      isBlacklisted: false,
      ...defaultData,
    }
    return new MerchantEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
