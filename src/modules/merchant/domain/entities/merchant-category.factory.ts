import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { MerchantCategoryOrmEntity } from '../../database/merchant-category/merchant-category.orm-entity'
import { MerchantCategoryRepository } from '../../database/merchant-category/merchant-category.repository'
import { MCC } from '../value-objects/mcc.value-object'
import {
  MerchantCategoryEntity,
  MerchantCategoryProps,
} from './merchant-category.entity'

interface MerchantCategoryFactoryProps {
  mcc?: MCC
  name?: string
  description?: string
  iconUrl?: string
}

export class MerchantCategoryFactory extends BaseFactory<
  MerchantCategoryEntity,
  MerchantCategoryFactoryProps,
  MerchantCategoryRepository,
  MerchantCategoryOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(MerchantCategoryRepository)
  }

  protected buildEntity(defaultData: MerchantCategoryFactoryProps) {
    const props: MerchantCategoryProps = {
      mcc: new MCC(faker.string.numeric(4)),
      defaultImageLinks: [],
      ...defaultData,
    }
    return new MerchantCategoryEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
