import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  MerchantMerchantOrganizationEntity,
  MerchantMerchantOrganizationProps,
} from '../../domain/entities/merchant-merchant-organization.entity'
import { MerchantMerchantOrganizationOrmEntity } from './merchant-merchant-organization.orm-entity'

export class MerchantMerchantOrganizationOrmMapper extends OrmMapper<
  MerchantMerchantOrganizationEntity,
  MerchantMerchantOrganizationOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: MerchantMerchantOrganizationEntity,
  ): OrmEntityProps<MerchantMerchantOrganizationOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<MerchantMerchantOrganizationOrmEntity> = {
      mid: props.mid.trim(),
      merchantName: props.merchantName.trim(),
      siret: props.siret.trim(),
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: MerchantMerchantOrganizationOrmEntity,
  ): EntityProps<MerchantMerchantOrganizationProps> {
    const id = new UUID(ormEntity.id)
    const props: MerchantMerchantOrganizationProps = {
      mid: ormEntity.mid,
      merchantName: ormEntity.merchantName,
      siret: ormEntity.siret,
    }
    return { id, props }
  }
}
