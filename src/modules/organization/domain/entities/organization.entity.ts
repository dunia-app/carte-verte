import _ from 'lodash'
import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UpdateAddressProps } from '../../../../libs/ddd/domain/value-objects/address.types'
import {
  Address,
  AddressProps,
} from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { Iban } from '../../../../libs/ddd/domain/value-objects/iban.value-object'
import { OrganizationName } from '../../../../libs/ddd/domain/value-objects/name.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  OrganizationAlreadyAcceptedOfferError,
  OrganizationAlreadyHasSiretError,
} from '../../errors/organization.errors'
import { OrganizationCreatedDomainEvent } from '../events/organization-created.domain-event'
import { OrganizationOffer } from '../value-objects/organization-offer.value-object'
import { OrganizationSettings } from '../value-objects/organization-settings.value-object'
import { OrganizationStatus } from './organization.types'

// Properties that are needed for an Organization creation
export interface CreateOrganizationProps {
  name: OrganizationName
  offer: OrganizationOffer
  address?: Address
  siret?: string
  settings?: OrganizationSettings
}

export interface OrganizationProps extends CreateOrganizationProps {
  hasAcceptedOffer: boolean
  iban?: Iban
  bankLabel?: string
  commonName?: string
}

export class OrganizationEntity extends AggregateRoot<OrganizationProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateOrganizationProps): OrganizationEntity {
    const id = UUID.generate()
    const props: OrganizationProps = { ...create, hasAcceptedOffer: false }
    const organization = new OrganizationEntity({ id, props })

    organization.addEvent(
      new OrganizationCreatedDomainEvent({
        aggregateId: id.value,
      }),
    )
    return organization
  }

  get name(): string {
    return this.props.name.value
  }

  get address(): Address | undefined {
    return this.props.address
  }

  get settings(): OrganizationSettings | undefined {
    return this.props.settings
  }

  get isSettingsComplete(): boolean {
    return !!this.settings && this.settings.isComplete
  }

  get offer(): OrganizationOffer {
    return this.props.offer
  }

  get siret(): string | undefined {
    return this.props.siret
  }

  get status(): OrganizationStatus {
    return !this.props.address || !this.props.siret
      ? OrganizationStatus.ORGANIZATION_NO_ADDRESS_OR_SIRET
      : !this.props.hasAcceptedOffer
      ? OrganizationStatus.ORGANIZATION_OFFER_NOT_ACCEPTED
      : OrganizationStatus.ORGANIZATION_ACTIVE
  }

  get physicalCardPriceForEmployee(): number {
    return Math.max(
      this.props.offer.physicalCardPrice -
        (this.props.settings ? this.props.settings.physicalCardCoverage : 0),
      0,
    )
  }

  get firstPhysicalCardPriceForEmployee(): number {
    return Math.max(
      this.props.offer.firstPhysicalCardPrice -
        (this.props.settings
          ? this.props.settings.firstPhysicalCardCoverage
          : 0),
      0,
    )
  }

  get physicalCardPriceForOrganization(): number {
    return Math.max(
      Math.min(
        this.props.offer.physicalCardPrice,
        this.props.settings ? this.props.settings.physicalCardCoverage : 0,
      ),
      0,
    )
  }

  get firstPhysicalCardPriceForOrganization(): number {
    return Math.max(
      Math.min(
        this.props.offer.firstPhysicalCardPrice,
        this.props.settings ? this.props.settings.firstPhysicalCardCoverage : 0,
      ),
      0,
    )
  }

  get iban(): Iban | undefined {
    return this.props.iban
  }

  get bankLabel(): string | undefined {
    return this.props.siret
  }

  set iban(iban: Iban | undefined) {
    this.props.iban = iban
  }

  set bankLabel(bankLabel: string | undefined) {
    this.props.bankLabel = bankLabel
  }

  getPhysicalCardPriceForOrganization(physicalCardsCount: number) {
    return physicalCardsCount == 0
      ? this.firstPhysicalCardPriceForOrganization
      : this.physicalCardPriceForOrganization
  }

  getPhysicalCardPriceForEmployee(physicalCardsCount: number) {
    return physicalCardsCount == 0
      ? this.firstPhysicalCardPriceForEmployee
      : this.physicalCardPriceForEmployee
  }

  // Used when siret API has error
  setInvalidatedSiret(
    siret: string,
  ): Result<true, OrganizationAlreadyHasSiretError> {
    if (this.props.siret) {
      return Result.err(new OrganizationAlreadyHasSiretError())
    }
    this.props.siret = siret
    return Result.ok(true)
  }

  setSiret(
    siret: string,
    name: OrganizationName,
    address: UpdateAddressProps,
  ): Result<true, OrganizationAlreadyHasSiretError> {
    if (this.props.address?.city) {
      return Result.err(new OrganizationAlreadyHasSiretError())
    }
    // Only a valid siret can update name or address
    this.props.siret = siret
    this.props.name = name
    this.props.address = new Address({
      ...this.props.address,
      ...address,
    } as AddressProps)
    return Result.ok(true)
  }

  acceptOffer(): Result<true, OrganizationAlreadyAcceptedOfferError> {
    if (this.props.hasAcceptedOffer) {
      return Result.err(new OrganizationAlreadyAcceptedOfferError())
    }
    this.props.hasAcceptedOffer = true
    return Result.ok(true)
  }

  setSettings(
    coveragePercent?: number,
    mealTicketAmount?: number,
    mealTicketDay?: number,
    mealTicketAutoRenew?: boolean,
    physicalCardCoverage?: number,
    firstPhysicalCardCoverage?: number,
  ) {
    this.props.settings = new OrganizationSettings({
      coveragePercent: coveragePercent,
      mealTicketAmount: mealTicketAmount,
      mealTicketDay: mealTicketDay,
      mealTicketAutoRenew: !_.isUndefined(mealTicketAutoRenew)
        ? mealTicketAutoRenew
        : this.props.settings
        ? this.props.settings.mealTicketAutoRenew
        : false,
      physicalCardCoverage: !_.isUndefined(physicalCardCoverage)
        ? physicalCardCoverage
        : this.props.settings
        ? this.props.settings.physicalCardCoverage
        : 0,
      firstPhysicalCardCoverage: !_.isUndefined(firstPhysicalCardCoverage)
        ? firstPhysicalCardCoverage
        : this.props.settings
        ? this.props.settings.firstPhysicalCardCoverage
        : 0,
    })
  }

  changeAddress(address: UpdateAddressProps) {
    this.props.address = new Address({
      ...this.props.address,
      ...address,
    } as AddressProps)
  }

  validate(): void {}
}
