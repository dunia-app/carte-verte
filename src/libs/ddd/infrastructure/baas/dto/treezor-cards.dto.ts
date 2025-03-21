import { NotImplementedException } from '@nestjs/common'
import {
  LockStatus,
  XPayProvider,
} from '../../../../../modules/card/domain/entities/card.types'
import { ArgumentInvalidException } from '../../../../exceptions/index'
import {
  TreezorCard,
  TreezorCardDigitalization,
  TreezorCardImage,
  TreezorIssuerInitiatedDigitizationData,
} from '../treezor.entity'
import {
  TreezorCardDigitalizationReasonCodeSuspendPermanently,
  TreezorCardDigitalizationReasonCodeSuspendTemporarly,
  TreezorCardDigitalizationReasonCodeUnsuspend,
  TreezorCardDigitalizationStatus,
  cardDigitalizationReasonCodeEnumToTreezorString,
} from '../treezor.types'

export interface PostCardsCreateVirtualInputProps {
  externalUserId: string
  masterWalletId: number
  permsGroup: string
  cardPrint: string
  designCode: string
  pin: string
  paymentDailyLimit: number
}

export class PostCardsCreateVirtualInput {
  constructor(props: PostCardsCreateVirtualInputProps) {
    this.userId = Number(props.externalUserId)
    this.walletId = props.masterWalletId
    this.permsGroup = props.permsGroup
    this.cardPrint = props.cardPrint
    this.designCode = props.designCode
    this.pin = props.pin
    this.paymentDailyLimit = props.paymentDailyLimit
  }

  readonly userId: number

  readonly walletId: number

  readonly permsGroup: string

  readonly cardPrint: string

  readonly designCode: string

  readonly pin: string

  readonly paymentDailyLimit: number
}

export interface PutCardLimitsInput {
  readonly limitPaymentAll?: number

  readonly paymentDailyLimit?: number

  // TO REMOVE
  readonly limitPaymentDay?: number
}

export interface PutCardOptionsInputProps {
  foreign?: boolean
  online?: boolean
  nfc?: boolean
  atm?: boolean
}
export class PutCardOptionsInput {
  constructor(props: PutCardOptionsInputProps) {
    this.foreign = props.foreign ? 1 : 0
    this.online = props.online ? 1 : 0
    this.nfc = props.nfc ? 1 : 0
    this.atm = props.atm ? 1 : 0
  }
  readonly foreign: number
  readonly online: number
  readonly nfc: number
  readonly atm: number
}

export interface PutLockUnlockCardInputProps {
  lockStatus: LockStatus
}

export class PutLockUnlockCardInput {
  constructor(props: PutLockUnlockCardInputProps) {
    switch (props.lockStatus) {
      case LockStatus.UNLOCK:
        this.lockStatus = 0
        break
      case LockStatus.LOCK:
        this.lockStatus = 1
        break
      case LockStatus.LOST:
        this.lockStatus = 2
        break
      case LockStatus.STOLEN:
        this.lockStatus = 3
        break
      case LockStatus.DESTROYED:
        this.lockStatus = 4
        break
      default:
        throw new NotImplementedException()
    }
  }

  readonly lockStatus: number
}

export interface RequestXPayCredentialInputProps {
  externalCardId: string
  tokenRequestor: XPayProvider
  certificates?: string[]
  nonce?: string
  nonceSignature?: string
}

export class RequestXPayCredentialInput {
  constructor(props: RequestXPayCredentialInputProps) {
    this.cardId = Number(props.externalCardId)
    this.tokenRequestor = props.tokenRequestor
    this.tokenRequestor = props.tokenRequestor
    if (this.tokenRequestor === XPayProvider.APPLE) {
      this.additionnalData = {
        certificates: [],
        nonce: props.nonce,
        nonceSignature: props.nonceSignature,
      }
      if (props.certificates) {
        this.additionnalData.certificates.push(...props.certificates)
      }
    }
  }
  readonly cardId: number
  readonly tokenRequestor: XPayProvider
  readonly additionnalData?: {
    readonly certificates: string[]
    readonly nonce?: string
    readonly nonceSignature?: string
  }
}

export interface PutSetPinInput {
  newPIN: string
  confirmPIN: string
}

export interface PutChangePinInput {
  currentPIN: string
  newPIN: string
  confirmPIN: string
}

export interface TreezorCardsResponse {
  cards: TreezorCard[]
}

export interface TreezorCardImagesResponse {
  cardimages: TreezorCardImage[]
}

export interface TreezorIssuerInitiatedDigitizationDatasResponse {
  issuerInitiatedDigitizationDatas: TreezorIssuerInitiatedDigitizationData[]
}

export interface TreezorIssuerInitiatedDigitizationDataResponse {
  issuerInitiatedDigitizationData: string
}

export interface TreezorCardDigitalizationsResponse {
  cardDigitalizations: TreezorCardDigitalization[]
}

export interface PutCardDigitalizationsInputProps {
  readonly status: TreezorCardDigitalizationStatus

  readonly reasonCode:
    | TreezorCardDigitalizationReasonCodeUnsuspend
    | TreezorCardDigitalizationReasonCodeSuspendTemporarly
}

export class PutCardDigitalizationsInput {
  constructor(props: PutCardDigitalizationsInputProps) {
    this.status = props.status.toLowerCase()
    // Check if status and reasonCode goes together
    if (
      (props.status === TreezorCardDigitalizationStatus.SUSPEND &&
        props.reasonCode in
          TreezorCardDigitalizationReasonCodeSuspendTemporarly) ||
      (props.status === TreezorCardDigitalizationStatus.UNSUSPEND &&
        props.reasonCode in TreezorCardDigitalizationReasonCodeUnsuspend)
    ) {
      this.reasonCode = cardDigitalizationReasonCodeEnumToTreezorString(
        props.reasonCode,
      )
    } else {
      throw new ArgumentInvalidException(
        `PutCardDigitalizationsInput parameters does not match : status ${props.status} and reasonCode ${props.reasonCode}`,
      )
    }
  }
  readonly status: string

  readonly reasonCode: string
}

export interface DeleteCardDigitalizationsInputProps {
  readonly reasonCode: TreezorCardDigitalizationReasonCodeSuspendPermanently
}
export class DeleteCardDigitalizationsInput {
  constructor(props: DeleteCardDigitalizationsInputProps) {
    this.reasonCode = cardDigitalizationReasonCodeEnumToTreezorString(
      props.reasonCode,
    )
  }
  readonly reasonCode: string
}
