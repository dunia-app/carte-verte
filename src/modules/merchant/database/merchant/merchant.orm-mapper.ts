import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { MerchantCategoryEntity } from '../../domain/entities/merchant-category.entity'
import {
  MerchantEntity,
  MerchantProps,
} from '../../domain/entities/merchant.entity'
import { MerchantGrades } from '../../domain/value-objects/merchant-grades.value-object'
import { MerchantCategoryOrmEntity } from '../merchant-category/merchant-category.orm-entity'
import { MerchantCategoryOrmMapper } from '../merchant-category/merchant-category.orm-mapper'
import { MerchantOrmEntity } from './merchant.orm-entity'

export class MerchantOrmMapper extends OrmMapper<
  MerchantEntity,
  MerchantOrmEntity
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
    entity: MerchantEntity,
  ): OrmEntityProps<MerchantOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<MerchantOrmEntity> = {
      mid: props.mid ? props.mid.trim() : undefined,
      name: props.name.trim(),
      merchantCategory: props.merchantCategory
        ? this.merchantCategoryMapper.toOrmEntity(props.merchantCategory)
        : undefined,
      merchantCategoryId: props.merchantCategory?.id.value,
      advantageForm: props.advantageForm,
      pointOfSaleType: props.pointOfSaleType,
      description: props.description,
      attribute: props.attribute,
      phone: props.phone,
      email: props.email?.value,
      website: props.website,
      // Address
      city: props.address?.city,
      postalCode: props.address?.postalCode,
      street: props.address?.street,
      country: props.address?.country,
      longitude: props.address?.longitude,
      latitude: props.address?.latitude,
      ///
      // Merchant grades
      bio: props.grades ? props.grades.bio : 0,
      local: props.grades ? props.grades.local : 0,
      vegetarian: props.grades ? props.grades.vegetarian : 0,
      antiwaste: props.grades ? props.grades.antiwaste : 0,
      nowaste: props.grades ? props.grades.nowaste : 0,
      inclusive: props.grades ? props.grades.inclusive : 0,
      total: props.grades ? props.grades.total : 0,
      ///
      imageLinks: props.imageLinks,
      labelName: props.labelName,
      deliveryCities: props.deliveryCities,
      reviewLink: props.reviewLink,
      isHidden: props.isHidden,
      isCashbackableSince: props.isCashbackableSince?.value,
      isBlacklisted: props.isBlacklisted,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: MerchantOrmEntity,
  ): EntityProps<MerchantProps> {
    const id = new UUID(ormEntity.id)
    const props: MerchantProps = {
      mid: ormEntity.mid,
      name: ormEntity.name,
      merchantCategory: ormEntity.merchantCategory
        ? this.merchantCategoryMapper.toDomainEntity(ormEntity.merchantCategory)
        : undefined,
      advantageForm: ormEntity.advantageForm
        ? ormEntity.advantageForm
        : undefined,
      pointOfSaleType: ormEntity.pointOfSaleType
        ? ormEntity.pointOfSaleType
        : undefined,
      description: ormEntity.description ? ormEntity.description : undefined,
      attribute: ormEntity.attribute ? ormEntity.attribute : undefined,
      phone: ormEntity.phone ? ormEntity.phone : undefined,
      email: ormEntity.email ? new Email(ormEntity.email) : undefined,
      website: ormEntity.website ? ormEntity.website : undefined,
      address: ormEntity.city
        ? new Address({
            city: ormEntity.city,
            postalCode: ormEntity.postalCode,
            street: ormEntity.street,
            country: ormEntity.country,
            longitude: ormEntity.longitude,
            latitude: ormEntity.latitude,
          })
        : undefined,
      grades: new MerchantGrades({
        bio: ormEntity.bio,
        local: ormEntity.local,
        vegetarian: ormEntity.vegetarian,
        antiwaste: ormEntity.antiwaste,
        nowaste: ormEntity.nowaste,
        inclusive: ormEntity.inclusive,
      }),
      imageLinks: ormEntity.imageLinks,
      labelName: ormEntity.labelName,
      deliveryCities: ormEntity.deliveryCities,
      reviewLink: ormEntity.reviewLink,
      isHidden: ormEntity.isHidden,
      isCashbackableSince: ormEntity.isCashbackableSince
        ? new DateVO(ormEntity.isCashbackableSince)
        : undefined,
      isBlacklisted: ormEntity.isBlacklisted,
    }
    return { id, props }
  }
}
