import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  AdvantageMerchantCategoryEntity,
  AdvantageMerchantCategoryProps,
} from '../../domain/entities/advantage-merchant-category.entity'
import { MerchantCategoryEntity } from '../../domain/entities/merchant-category.entity'
import { MerchantCategoryOrmEntity } from '../merchant-category/merchant-category.orm-entity'
import { MerchantCategoryOrmMapper } from '../merchant-category/merchant-category.orm-mapper'
import { AdvantageMerchantCategoryOrmEntity } from './advantage-merchant-category.orm-entity'

export class AdvantageMerchantCategoryOrmMapper extends OrmMapper<
  AdvantageMerchantCategoryEntity,
  AdvantageMerchantCategoryOrmEntity
> {
  protected encryptedFields = [] as const
  merchantCategoryMapper: OrmMapper<
    MerchantCategoryEntity,
    MerchantCategoryOrmEntity
  > = new MerchantCategoryOrmMapper(
    MerchantCategoryEntity,
    MerchantCategoryOrmEntity,
    this.config,
  )

  protected toOrmProps(
    entity: AdvantageMerchantCategoryEntity,
  ): OrmEntityProps<AdvantageMerchantCategoryOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<AdvantageMerchantCategoryOrmEntity> = {
      advantageId: props.advantageId.value,
      merchantCategoryId: props.merchantCategoryId.value,
      isBlackList: props.isBlackList,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: AdvantageMerchantCategoryOrmEntity,
  ): EntityProps<AdvantageMerchantCategoryProps> {
    const id = new UUID(ormEntity.id)
    const props: AdvantageMerchantCategoryProps = {
      advantageId: new UUID(ormEntity.advantageId),
      merchantCategoryId: new UUID(ormEntity.merchantCategoryId),
      isBlackList: ormEntity.isBlackList,
    }
    return { id, props }
  }
}
