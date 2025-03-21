import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  MerchantFilterEntity,
  MerchantFilterProps,
} from '../../domain/entities/merchant-filter.entity'
import { MerchantFilterOrmEntity } from './merchant-filter.orm-entity'

export class MerchantFilterOrmMapper extends OrmMapper<
  MerchantFilterEntity,
  MerchantFilterOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: MerchantFilterEntity,
  ): OrmEntityProps<MerchantFilterOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<MerchantFilterOrmEntity> = {
      code: props.code,
      name: props.name,
      parentCode: props.parentCode,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: MerchantFilterOrmEntity,
  ): EntityProps<MerchantFilterProps> {
    const id = new UUID(ormEntity.id)
    const props: MerchantFilterProps = {
      code: ormEntity.code,
      name: ormEntity.name,
      parentCode: ormEntity.parentCode,
    }
    return { id, props }
  }
}
