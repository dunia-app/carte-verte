import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  MerchantMerchantFilterEntity,
  MerchantMerchantFilterProps,
} from '../../domain/entities/merchant-merchant-filter.entity'
import { MerchantMerchantFilterOrmEntity } from './merchant-merchant-filter.orm-entity'

export class MerchantMerchantFilterOrmMapper extends OrmMapper<
  MerchantMerchantFilterEntity,
  MerchantMerchantFilterOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: MerchantMerchantFilterEntity,
  ): OrmEntityProps<MerchantMerchantFilterOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<MerchantMerchantFilterOrmEntity> = {
      code: props.code,
      mid: props.mid,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: MerchantMerchantFilterOrmEntity,
  ): EntityProps<MerchantMerchantFilterProps> {
    const id = new UUID(ormEntity.id)
    const props: MerchantMerchantFilterProps = {
      code: ormEntity.code,
      mid: ormEntity.mid,
    }
    return { id, props }
  }
}
