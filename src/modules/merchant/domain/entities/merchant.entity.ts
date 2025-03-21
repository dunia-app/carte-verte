import { AggregateRoot } from '../../../../libs/ddd/domain/base-classes/aggregate-root.base'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { MerchantGrades } from '../value-objects/merchant-grades.value-object'
import { MerchantCategoryEntity } from './merchant-category.entity'
import { AdvantageForm, PointOfSaleType } from './merchant.types'

export interface CreateMerchantProps {
  mid?: string
  merchantCategory?: MerchantCategoryEntity
  name: string
  address?: Address
}

export interface MerchantProps extends CreateMerchantProps {
  advantageForm?: AdvantageForm
  pointOfSaleType?: PointOfSaleType
  description?: string
  attribute?: string
  phone?: string
  email?: Email
  website?: string
  grades?: MerchantGrades
  imageLinks: string[]
  labelName?: string
  deliveryCities?: string[]
  reviewLink?: string
  isHidden: boolean
  isCashbackableSince?: DateVO
  isBlacklisted: boolean
}

export class MerchantEntity extends AggregateRoot<MerchantProps> {
  //Set in the parent Entity
  protected readonly _id!: UUID

  static create(create: CreateMerchantProps): MerchantEntity {
    const id = UUID.generate()
    const props: MerchantProps = {
      imageLinks: [],
      isHidden: false,
      isBlacklisted: false,
      ...create,
    }

    if (props.advantageForm === AdvantageForm.CASHBACK && props.mid) {
      props.isCashbackableSince = new DateVO(new Date())
    }

    const merchant = new MerchantEntity({ id, props })

    return merchant
  }

  get mid(): string | undefined {
    return this.props.mid
  }

  set mid(mid: string | undefined) {
    this.props.mid = mid
  }

  get name(): string {
    return this.props.name
  }

  get advantageForm(): AdvantageForm | undefined {
    return this.props.advantageForm
  }

  get mcc(): string | undefined {
    return this.props.merchantCategory?.mcc.value
  }

  get description(): string | undefined {
    return this.props.description
  }

  get phone(): string | undefined {
    return this.props.phone
  }

  get address(): Address | undefined {
    return this.props.address
  }

  set address(address: Address | undefined) {
    this.props.address = address
  }

  get email(): string | undefined {
    return this.props.email ? this.props.email.value : undefined
  }

  get website(): string | undefined {
    return this.props.website
  }

  get imageLinks(): string[] {
    return this.props.imageLinks
  }

  get reviewLink(): string | undefined {
    return this.props.reviewLink
  }

  set merchantCategory(merchantCategory: MerchantCategoryEntity | undefined) {
    this.props.merchantCategory = merchantCategory
  }

  update(update: MerchantProps): boolean {
    if (
      this.props.advantageForm === update.advantageForm &&
      this.props.pointOfSaleType === update.pointOfSaleType &&
      this.props.description === update.description &&
      this.props.attribute === update.attribute &&
      this.props.phone === update.phone &&
      this.props.email === update.email &&
      this.props.website === update.website &&
      JSON.stringify(this.props.imageLinks) ===
        JSON.stringify(update.imageLinks) &&
      this.props.labelName === update.labelName &&
      JSON.stringify(this.props.deliveryCities) ===
        JSON.stringify(update.deliveryCities) &&
      this.props.reviewLink === update.reviewLink &&
      this.props.mid === update.mid &&
      this.props.name === update.name &&
      this.props.address?.city === update.address?.city &&
      this.props.address?.street === update.address?.street &&
      this.props.address?.postalCode === update.address?.postalCode &&
      this.props.address?.latitude === update.address?.latitude &&
      this.props.address?.longitude === update.address?.longitude &&
      this.props.address?.country === update.address?.country &&
      this.props.grades?.antiwaste === update.grades?.antiwaste &&
      this.props.grades?.bio === update.grades?.bio &&
      this.props.grades?.inclusive === update.grades?.inclusive &&
      this.props.grades?.local === update.grades?.local &&
      this.props.grades?.nowaste === update.grades?.nowaste &&
      this.props.grades?.vegetarian === update.grades?.vegetarian &&
      this.props.isHidden === update.isHidden &&
      this.props.isBlacklisted === update.isBlacklisted &&
      this.props.merchantCategory?.id === update.merchantCategory?.id
    ) {
      return false
    }
    const mid = update.mid ? update.mid : this.props.mid!
    // If cashback is active and mid has changed
    // Or if cashback is active and it was not
    // We trigger an event for retroactive cashback
    if (
      (this.props.advantageForm === AdvantageForm.CASHBACK &&
        isUndefined(update.advantageForm) &&
        this.props.mid !== update.mid) ||
      (update.advantageForm == AdvantageForm.CASHBACK &&
        this.props.mid !== update.mid) ||
      (this.props.advantageForm !== AdvantageForm.CASHBACK &&
        update.advantageForm == AdvantageForm.CASHBACK &&
        mid)
    ) {
      this.props.isCashbackableSince = new DateVO(new Date())
    }
    this.props.merchantCategory = update.merchantCategory
      ? update.merchantCategory
      : this.props.merchantCategory
    this.props.advantageForm = update.advantageForm
      ? update.advantageForm
      : this.props.advantageForm
    this.props.pointOfSaleType = update.pointOfSaleType
      ? update.pointOfSaleType
      : this.props.pointOfSaleType
    this.props.description = update.description
      ? update.description
      : this.props.description
    this.props.attribute = update.attribute
      ? update.attribute
      : this.props.attribute
    this.props.phone = update.phone ? update.phone : this.props.phone
    this.props.email = update.email ? update.email : this.props.email
    this.props.website = update.website ? update.website : this.props.website
    this.props.imageLinks = update.imageLinks
      ? update.imageLinks
      : this.props.imageLinks
    this.props.labelName = update.labelName
      ? update.labelName
      : this.props.labelName
    this.props.deliveryCities = update.deliveryCities
      ? update.deliveryCities
      : this.props.deliveryCities
    this.props.reviewLink = update.reviewLink
      ? update.reviewLink
      : this.props.reviewLink
    this.props.mid = update.mid ? update.mid : this.props.mid
    this.props.name = update.name ? update.name : this.props.name
    this.props.address = update.address ? update.address : this.props.address
    this.props.grades = update.grades ? update.grades : this.props.grades
    this.props.isHidden = update.isHidden
      ? update.isHidden
      : this.props.isHidden
    this.props.isBlacklisted = update.isBlacklisted
      ? update.isBlacklisted
      : this.props.isBlacklisted
    return true
  }

  public validate(): void {}
}
