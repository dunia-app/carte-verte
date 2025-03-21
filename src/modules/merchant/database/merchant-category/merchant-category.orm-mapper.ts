import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  MerchantCategoryEntity,
  MerchantCategoryProps,
} from '../../domain/entities/merchant-category.entity'
import { MCC } from '../../domain/value-objects/mcc.value-object'
import { MerchantCategoryOrmEntity } from './merchant-category.orm-entity'

export class MerchantCategoryOrmMapper extends OrmMapper<
  MerchantCategoryEntity,
  MerchantCategoryOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: MerchantCategoryEntity,
  ): OrmEntityProps<MerchantCategoryOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<MerchantCategoryOrmEntity> = {
      mcc: props.mcc.value,
      name: props.name,
      description: props.description,
      iconUrl: props.iconUrl,
      defaultImageLinks: props.defaultImageLinks,
      carbonFootprint: props.carbonFootprint,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: MerchantCategoryOrmEntity,
  ): EntityProps<MerchantCategoryProps> {
    const id = new UUID(ormEntity.id)
    const props: MerchantCategoryProps = {
      mcc: new MCC(ormEntity.mcc),
      name: ormEntity.name ? ormEntity.name : undefined,
      description: ormEntity.description ? ormEntity.description : undefined,
      iconUrl: ormEntity.iconUrl ? ormEntity.iconUrl : undefined,
      defaultImageLinks: ormEntity.defaultImageLinks,
      carbonFootprint: ormEntity.carbonFootprint
        ? ormEntity.carbonFootprint
        : undefined,
    }
    return { id, props }
  }
}
