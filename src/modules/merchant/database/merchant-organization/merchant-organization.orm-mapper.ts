import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  MerchantOrganizationEntity,
  MerchantOrganizationProps,
} from '../../domain/entities/merchant-organization.entity'
import { MerchantOrganizationOrmEntity } from './merchant-organization.orm-entity'

export class MerchantOrganizationOrmMapper extends OrmMapper<
  MerchantOrganizationEntity,
  MerchantOrganizationOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: MerchantOrganizationEntity,
  ): OrmEntityProps<MerchantOrganizationOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<MerchantOrganizationOrmEntity> = {
      siret: props.siret.trim(),
      cntrRegistrationNumber: props.cntrRegistrationNumber,
      brandName: props.brandName,
      organizationName: props.organizationName,
      naf: props.naf,
      city: props.address?.city,
      postalCode: props.address?.postalCode!,
      street: props.address?.street,
      phone: props.phone,
      email: props.email,
      registrationClosedAt: props.registrationClosedAt?.value,
      registrationStartedAt: props.registrationStartedAt?.value,
      organizationCreatedAt: props.organizationCreatedAt?.value,
      description: props.description,
      website: props.website,
      imageLinks: props.imageLinks,
      unactivatedAt: props.unactivatedAt?.value,
      affiliationInvitationSent: props.affiliationInvitationSent,
      emailBouncedOn: props.emailBouncedOn?.value,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: MerchantOrganizationOrmEntity,
  ): EntityProps<MerchantOrganizationProps> {
    const id = new UUID(ormEntity.id)
    const props: MerchantOrganizationProps = {
      siret: ormEntity.siret,
      cntrRegistrationNumber: ormEntity.cntrRegistrationNumber
        ? ormEntity.cntrRegistrationNumber
        : null,
      brandName: ormEntity.brandName,
      organizationName: ormEntity.organizationName,
      naf: ormEntity.naf,
      address: new Address({
        city: ormEntity.city,
        postalCode: ormEntity.postalCode,
        street: ormEntity.street,
      }),
      phone: ormEntity.phone ? ormEntity.phone : undefined,
      email: ormEntity.email ? ormEntity.email : undefined,
      registrationClosedAt: ormEntity.registrationClosedAt
        ? new DateVO(ormEntity.registrationClosedAt)
        : undefined,
      registrationStartedAt: ormEntity.registrationStartedAt
        ? new DateVO(ormEntity.registrationStartedAt)
        : undefined,
      organizationCreatedAt: ormEntity.organizationCreatedAt
        ? new DateVO(ormEntity.organizationCreatedAt)
        : undefined,
      description: ormEntity.description ? ormEntity.description : undefined,
      website: ormEntity.website ? ormEntity.website : undefined,
      imageLinks: ormEntity.imageLinks,
      unactivatedAt: ormEntity.unactivatedAt
        ? new DateVO(ormEntity.unactivatedAt)
        : undefined,
      affiliationInvitationSent: ormEntity.affiliationInvitationSent,
      emailBouncedOn: ormEntity.emailBouncedOn
        ? new DateVO(ormEntity.emailBouncedOn)
        : undefined,
    }
    return { id, props }
  }
}
