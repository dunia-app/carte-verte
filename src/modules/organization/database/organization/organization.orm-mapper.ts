import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { Iban } from '../../../../libs/ddd/domain/value-objects/iban.value-object'
import { OrganizationName } from '../../../../libs/ddd/domain/value-objects/name.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  OrganizationEntity,
  OrganizationProps,
} from '../../domain/entities/organization.entity'
import { OrganizationOffer } from '../../domain/value-objects/organization-offer.value-object'
import { OrganizationSettings } from '../../domain/value-objects/organization-settings.value-object'
import { OrganizationOrmEntity } from './organization.orm-entity'

export class OrganizationOrmMapper extends OrmMapper<
  OrganizationEntity,
  OrganizationOrmEntity
> {
  protected encryptedFields = ['city', 'postalCode', 'street', 'siret'] as const
  protected toOrmProps(
    entity: OrganizationEntity,
  ): OrmEntityProps<OrganizationOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<OrganizationOrmEntity> = {
      name: props.name.value,
      // Address
      city: props.address?.city,
      postalCode: props.address?.postalCode,
      street: props.address?.street,
      longitude: props.address?.longitude,
      latitude: props.address?.latitude,
      ///
      siret: props.siret,
      hasAcceptedOffer: props.hasAcceptedOffer,
      // Organization offer
      commission: props.offer.commission,
      commissionType: props.offer.commissionType,
      advantageInShops: props.offer.advantageInShops,
      physicalCardPrice: props.offer.physicalCardPrice,
      firstPhysicalCardPrice: props.offer.firstPhysicalCardPrice,
      ///
      // OrganizationSettings
      coveragePercent: props.settings?.coveragePercent,
      mealTicketAmount: props.settings?.mealTicketAmount,
      mealTicketDay: props.settings?.mealTicketDay,
      mealTicketAutoRenew: props.settings?.mealTicketAutoRenew,
      physicalCardCoverage: props.settings?.physicalCardCoverage,
      firstPhysicalCardCoverage: props.settings?.firstPhysicalCardCoverage,
      ///
      iban: props.iban?.value,
      bankLabel: props.bankLabel,
      commonName: props.commonName,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: OrganizationOrmEntity,
  ): EntityProps<OrganizationProps> {
    const id = new UUID(ormEntity.id)
    const props: OrganizationProps = {
      name: new OrganizationName(ormEntity.name),
      siret: ormEntity.siret,
      hasAcceptedOffer: ormEntity.hasAcceptedOffer,
      address: ormEntity.city
        ? new Address({
            city: ormEntity.city,
            postalCode: ormEntity.postalCode,
            street: ormEntity.street,
            longitude: ormEntity.longitude,
            latitude: ormEntity.latitude,
          })
        : undefined,
      offer: new OrganizationOffer({
        commission: ormEntity.commission,
        commissionType: ormEntity.commissionType,
        advantageInShops: ormEntity.advantageInShops,
        physicalCardPrice: ormEntity.physicalCardPrice,
        firstPhysicalCardPrice: ormEntity.firstPhysicalCardPrice,
      }),
      settings: !(
        !ormEntity.coveragePercent &&
        !ormEntity.mealTicketAmount &&
        !ormEntity.mealTicketDay
      )
        ? new OrganizationSettings({
            coveragePercent: ormEntity.coveragePercent
              ? ormEntity.coveragePercent
              : undefined,
            mealTicketAmount: ormEntity.mealTicketAmount
              ? ormEntity.mealTicketAmount
              : undefined,
            mealTicketDay: ormEntity.mealTicketDay
              ? ormEntity.mealTicketDay
              : undefined,
            mealTicketAutoRenew: ormEntity.mealTicketAutoRenew
              ? ormEntity.mealTicketAutoRenew
              : false,
            physicalCardCoverage: ormEntity.physicalCardCoverage
              ? ormEntity.physicalCardCoverage
              : 0,
            firstPhysicalCardCoverage: ormEntity.firstPhysicalCardCoverage
              ? ormEntity.firstPhysicalCardCoverage
              : 0,
          })
        : undefined,
      iban: ormEntity.iban ? new Iban(ormEntity.iban) : undefined,
      bankLabel: ormEntity.bankLabel ? ormEntity.bankLabel : undefined,
      commonName: ormEntity.commonName ? ormEntity.commonName : undefined,
    }
    return { id, props }
  }
}
