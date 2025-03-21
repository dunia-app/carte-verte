import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'

export interface CreateMerchantOrganizationProps {
  siret: string
  cntrRegistrationNumber: string | null
  brandName: string
  organizationName: string
  naf: string
  address: Address
  phone?: string
  email?: string
  registrationClosedAt?: DateVO
  registrationStartedAt?: DateVO
  organizationCreatedAt?: DateVO
}

export interface MerchantOrganizationProps
  extends CreateMerchantOrganizationProps {
  description?: string
  website?: string
  imageLinks: string[]
  unactivatedAt?: DateVO
  affiliationInvitationSent: number
  emailBouncedOn?: DateVO
}

export class MerchantOrganizationEntity extends AggregateRoot<MerchantOrganizationProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(
    create: CreateMerchantOrganizationProps,
  ): MerchantOrganizationEntity {
    const id = UUID.generate()
    const props: MerchantOrganizationProps = {
      imageLinks: [],
      affiliationInvitationSent: 0,
      ...create,
    }
    const merchantOrganization = new MerchantOrganizationEntity({ id, props })
    return merchantOrganization
  }

  update(update: CreateMerchantOrganizationProps): boolean {
    if (
      this.props.cntrRegistrationNumber === update.cntrRegistrationNumber &&
      this.props.brandName === update.brandName &&
      this.props.organizationName === update.organizationName &&
      this.props.naf === update.naf &&
      this.props.address.city === update.address.city &&
      this.props.address.postalCode === update.address.postalCode &&
      this.props.address.street === update.address.street &&
      this.props.phone === update.phone &&
      this.props.email === update.email &&
      this.props.registrationClosedAt?.value.toDateString() ===
        update.registrationClosedAt?.value.toDateString() &&
      this.props.registrationStartedAt?.value.toDateString() ===
        update.registrationStartedAt?.value.toDateString() &&
      this.props.organizationCreatedAt?.value.toDateString() ===
        update.organizationCreatedAt?.value.toDateString()
    ) {
      return false
    }
    this.props.cntrRegistrationNumber = update.cntrRegistrationNumber
    this.props.brandName = update.brandName
    this.props.organizationName = update.organizationName
    this.props.naf = update.naf
    this.props.address = update.address
    this.props.phone = update.phone
    this.props.email = update.email
    this.props.registrationClosedAt = update.registrationClosedAt
    this.props.registrationStartedAt = update.registrationStartedAt
    this.props.organizationCreatedAt = update.organizationCreatedAt
    return true
  }

  get siret(): string {
    return this.props.siret
  }

  get cntrRegistrationNumber(): string | null {
    return this.props.cntrRegistrationNumber
  }

  get description(): string | undefined {
    return this.props.description
  }

  get phone(): string | undefined {
    return this.props.phone
  }

  get address(): Address {
    return this.props.address
  }

  set address(address: Address) {
    this.props.address = address
  }

  get email(): string | undefined {
    return this.props.email
  }

  get website(): string | undefined {
    return this.props.website
  }

  get imageLinks(): string[] {
    return this.props.imageLinks
  }

  get brandName(): string {
    return this.props.brandName
  }

  get organizationName(): string {
    return this.props.organizationName
  }

  set unactivatedAt(unactivatedAt: DateVO) {
    this.props.unactivatedAt = unactivatedAt
  }

  get affiliationInvitationSent(): number {
    return this.props.affiliationInvitationSent
  }

  set affiliationInvitationSent(nbTransaction: number) {
    this.props.affiliationInvitationSent = nbTransaction
  }

  public validate(): void {}
}
