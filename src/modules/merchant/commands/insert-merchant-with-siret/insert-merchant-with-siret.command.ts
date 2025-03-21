import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { InsertMerchantWithSiretFile } from './insert-merchant-with-siret.request.dto'

// Command is a plain object with properties
export class InsertMerchantWithSiretCommand extends Command<
  number,
  ExceptionBase
> {
  constructor(props: CommandProps<InsertMerchantWithSiretCommand>) {
    super(props)
    this.merchants = props.merchants
  }

  readonly merchants: InsertMerchantWithSiret[]
}

export class InsertMerchantWithSiret {
  constructor(props: InsertMerchantWithSiretFile) {
    this.matchConfirmed = props['match confirmed'] === 'TRUE'
    this.matchWith = props['matchWith']
    this.fileId = props['file:id']
    this.fileName = props['file:name']
    this.fileSiret = props['file:siret']
    this.fileDescription = props['file:description']
    this.filePhone = props['file:phone']
    this.fileCity = props['file:city']
    this.filePostalCode = props['file:postalCode']
    this.fileStreet = props['file:street']
    this.fileLongitude = props['file:longitude']
    this.fileLatitude = props['file:latitude']
    this.fileEmail = props['file:email']
    this.fileWebsite = props['file:website']
    this.fileBio = props['file:bio']
    this.fileLocal = props['file:local']
    this.fileVegetarian = props['file:vegetarian']
    this.fileAntiwaste = props['file:antiwaste']
    this.fileNowaste = props['file:nowaste']
    this.fileInclusive = props['file:inclusive']
    this.fileImageLinks = props['file:imageLinks']
    this.fileLabelName = props['file:labelName']
    this.propositionId = props['proposition:id']
    this.propositionSiret = props['proposition:siret']
    this.propositionCntrRegistrationNumber =
      props['proposition:cntrRegistrationNumber']
    this.propositionBrandName = props['proposition:brandName']
    this.propositionOrganizationName = props['proposition:organizationName']
    this.propositionNaf = props['proposition:naf']
    this.propositionCity = props['proposition:city']
    this.propositionPostalCode = props['proposition:postalCode']
    this.propositionStreet = props['proposition:street']
    this.propositionPhone = props['proposition:phone']
    this.propositionEmail = props['proposition:email']
  }

  readonly matchConfirmed?: boolean

  readonly matchWith?: string

  readonly fileId?: string

  readonly fileName?: string

  readonly fileSiret?: string

  readonly fileDescription?: string

  readonly filePhone?: string

  readonly fileCity?: string

  readonly filePostalCode?: string

  readonly fileStreet?: string

  readonly fileLongitude?: string

  readonly fileLatitude?: string

  readonly fileEmail?: string

  readonly fileWebsite?: string

  readonly fileBio?: string

  readonly fileLocal?: string

  readonly fileVegetarian?: string

  readonly fileAntiwaste?: string

  readonly fileNowaste?: string

  readonly fileInclusive?: string

  readonly fileImageLinks?: string

  readonly fileLabelName?: string

  readonly propositionId?: string

  readonly propositionSiret?: string

  readonly propositionCntrRegistrationNumber?: string

  readonly propositionBrandName?: string

  readonly propositionOrganizationName?: string

  readonly propositionNaf?: string

  readonly propositionCity?: string

  readonly propositionPostalCode?: string

  readonly propositionStreet?: string

  readonly propositionPhone?: string

  readonly propositionEmail?: string
}
