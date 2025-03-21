import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import {
  AdvantageForm,
  PointOfSaleType,
} from '../../domain/entities/merchant.types'
import { MCC } from '../../domain/value-objects/mcc.value-object'
import { MccNotFoundError } from '../../errors/merchant.errors'

// Command is a plain object with properties
export class UpsertMerchantCommand extends Command<
  'updated' | 'inserted',
  MccNotFoundError
> {
  constructor(props: CommandProps<UpsertMerchantCommand>) {
    super(props)
    this.merchantId = props.merchantId
    this.mid = props.mid
    this.name = props.name
    this.mcc = props.mcc
    this.siret = props.siret
    this.advantageForm = props.advantageForm
    this.pointOfSaleType = props.pointOfSaleType
    this.description = props.description
    this.phone = props.phone
    this.city = props.city
    this.postalCode = props.postalCode
    this.street = props.street
    this.longitude = props.longitude
    this.latitude = props.latitude
    this.email = props.email
    this.website = props.website
    this.bio = props.bio
    this.local = props.local
    this.vegetarian = props.vegetarian
    this.antiwaste = props.antiwaste
    this.nowaste = props.nowaste
    this.inclusive = props.inclusive
    this.imageLinks = props.imageLinks
    this.deliveryCities = props.deliveryCities
    this.attribute = props.attribute
    this.labelName = props.labelName
    this.reviewLink = props.reviewLink
    this.isHidden = props.isHidden
    this.isBlacklisted = props.isBlacklisted
    this.filterCodes = props.filterCodes
  }

  readonly merchantId?: string

  readonly mid?: string

  readonly name?: string

  readonly mcc?: MCC

  readonly siret?: string

  readonly advantageForm?: AdvantageForm

  readonly pointOfSaleType?: PointOfSaleType

  readonly description?: string

  readonly phone?: string

  readonly city?: string

  readonly postalCode?: string

  readonly street?: string

  readonly longitude?: number

  readonly latitude?: number

  readonly email?: Email

  readonly website?: string

  readonly bio?: number

  readonly local?: number

  readonly vegetarian?: number

  readonly antiwaste?: number

  readonly nowaste?: number

  readonly inclusive?: number

  readonly imageLinks: string[]

  readonly deliveryCities?: string[]

  readonly attribute?: string

  readonly labelName?: string

  readonly reviewLink?: string

  readonly isHidden?: boolean

  readonly isBlacklisted?: boolean

  readonly filterCodes?: string[]
}
