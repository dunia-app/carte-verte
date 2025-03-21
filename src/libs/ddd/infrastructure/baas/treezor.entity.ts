import moment = require('moment')
import { toScale } from '../../../../helpers/math.helper'
import { removeWhitespace } from '../../../../helpers/string.helper'
import { LockStatus } from '../../../../modules/card/domain/entities/card.types'
import {
  PANEntryMethod,
  TransactionDeclinedReason,
  TransactionStatus,
} from '../../../../modules/transaction/domain/entities/transaction.types'
import { CardAcquisitionPayinStatus } from '../../../../modules/wallet/domain/entities/card-acquisition-payin.types'
import {
  BaasCardProps,
  BaasPayinProps,
  BaasTransactionProps,
  BaasUserProps,
} from '../../domain/ports/baas.port'
import { UUID } from '../../domain/value-objects/uuid.value-object'
import { hipayStatusToCardAcquisitionPayinStatus } from '../card-acquisition-service/hipay.entity'
import {
  TreezorActivationMethod,
  TreezorDeviceType,
  getPANEntryMethod,
  getTreezorDate,
  transactionResponseCodeToDeclinedReason,
  transactionStatusToEnum,
} from './treezor.types'

const treezorTransactionSign = -1
export interface TreezorUser {
  userId: number
  email: string
  lastname: string
  firstname: string
  mobile: string
  birthday: string
  street: string
  street2: string
  city: string
  postalCode: string
}

export function treezorUserPropsToBaasUserProps(
  user: TreezorUser,
): BaasUserProps {
  return {
    userId: user.userId.toString(),
    email: user.email,
    lastname: user.lastname,
    firstname: user.firstname,
    mobile: user.mobile,
    birthday: new Date(user.birthday),
    address: {
      street: user.street,
      street2: user.street2,
      city: user.city,
      postalCode: user.postalCode,
    },
  }
}

export interface TreezorCard {
  cardId: number
  publicToken: string
  limitPaymentDay: number
  limitPaymentAll: number
  statusCode: LockStatus
  embossedName: string
  maskedPan: string
  pinTryExceeds: number
  optionAtm: number
  optionForeign: number
  optionOnline: number
  optionNfc: number
}

export function treezorCardPropsToBaasCardProps(
  card: TreezorCard,
): BaasCardProps {
  return {
    cardId: card.cardId,
    publicToken: card.publicToken,
    limitPaymentDay: card.limitPaymentDay,
    limitPaymentAll: card.limitPaymentAll,
    statusCode: card.statusCode,
    embossedName: card.embossedName,
    maskedPan: card.maskedPan,
    pinTryExceeds: card.pinTryExceeds,
    optionAtm: card.optionAtm,
    optionForeign: card.optionForeign,
    optionOnline: card.optionOnline,
    optionNfc: card.optionNfc,
  }
}

export interface TreezorCardImage {
  id: string
  cardId: string
  file: string
}

export interface TreezorTransactionProps {
  cardtransactionId: string
  cardId: string
  merchantId: string
  merchantName: string
  merchantCity: string
  merchantCountry: string
  merchantAddress?: string
  paymentLocalTime: string
  paymentLocalDate: string
  paymentAmount: string
  paymentId: string
  paymentStatus: string
  authorizationNote: string
  authorizationResponseCode: string
  mccCode: string
  authorizationIssuerId: string
  authorizationMti: string
  panEntryMethod: number
}

export class TreezorCardTransaction {
  constructor(props: TreezorTransactionProps) {
    this.cardtransactionId = props.cardtransactionId
    this.cardId = removeWhitespace(props.cardId.toString().trim())
    this.merchantId = removeWhitespace(props.merchantId.toString().trim())
    this.merchantName = removeWhitespace(props.merchantName.toString().trim())
    this.merchantCity = removeWhitespace(props.merchantCity.toString().trim())
    this.merchantCountry = removeWhitespace(
      props.merchantCountry.toString().trim(),
    )
    this.merchantAddress = props.merchantAddress
    this.paymentDate = getTreezorDate(
      props.paymentLocalTime,
      props.paymentLocalDate,
    )
    // Safeguard in case treezor dates are too old
    if (this.paymentDate < moment().subtract(2, 'week').toDate()) {
      this.paymentDate = new Date()
    }
    // Safeguard in case treezor dates are too far in the future
    if (this.paymentDate > moment().add(3, 'day').toDate()) {
      this.paymentDate = new Date()
    }
    this.paymentId = removeWhitespace(props.paymentId.toString().trim())
    this.paymentStatus = transactionStatusToEnum(props.paymentStatus)
    this.paymentAmount = toScale(
      Number(props.paymentAmount) * treezorTransactionSign,
      2,
    )
    this.authorizationNote = props.authorizationNote
    this.authorizationResponseCode = props.authorizationResponseCode
    this.mccCode = props.mccCode
    this.authorizationIssuerId = props.authorizationIssuerId
    this.authorizationMti = props.authorizationMti
    this.declinedReason = transactionResponseCodeToDeclinedReason(
      props.authorizationResponseCode,
      props.authorizationNote,
    )
    this.panEntryMethod = getPANEntryMethod(props.panEntryMethod)
  }
  cardtransactionId: string
  cardId: string
  merchantId: string
  merchantName: string
  merchantCity: string
  merchantCountry: string
  merchantAddress?: string
  paymentDate: Date
  paymentAmount: number
  paymentId: string
  paymentStatus: TransactionStatus
  authorizationNote: string
  authorizationResponseCode: string
  mccCode: string
  authorizationIssuerId: string
  authorizationMti: string
  declinedReason?: TransactionDeclinedReason
  panEntryMethod: PANEntryMethod
}

export function treezorTransactionPropsToBaasTransactionProps(
  transaction: TreezorTransactionProps,
): BaasTransactionProps {
  const formattedPayload = new TreezorCardTransaction(transaction)
  return {
    externalCardId: formattedPayload.cardId,
    mid: formattedPayload.merchantId,
    mcc: formattedPayload.mccCode,
    merchantName: formattedPayload.merchantName,
    merchantCity: formattedPayload.merchantCity,
    merchantCountry: formattedPayload.merchantCountry,
    merchantAddress: formattedPayload.merchantAddress,
    externalTransactionId: formattedPayload.cardtransactionId,
    externalPaymentId: formattedPayload.paymentId,
    paymentDate: formattedPayload.paymentDate,
    amount: formattedPayload.paymentAmount,
    status: formattedPayload.paymentStatus,
    authorizationNote: formattedPayload.authorizationNote,
    authorizationResponseCode: formattedPayload.authorizationResponseCode,
    authorizationIssuerId: formattedPayload.authorizationIssuerId,
    authorizationMti: formattedPayload.authorizationMti,
    declinedReason: formattedPayload.declinedReason,
    panEntryMethod: formattedPayload.panEntryMethod,
  }
}

export class TreezorMccGroup {}

export class TreezorMidGroup {}

export class TreezorPayout {}

export interface TreezorIssuerInitiatedDigitizationData {
  credential: string
}

export interface TreezorCardDigitalizationProps {
  activationCode: string
  activationCodeExpiry: string
  activationMethod: string
  externalId: string
  cardId: number
  deviceName: string
  deviceType: string
  expirationDate: string
  tokenRequestor: string
}

export class TreezorCardDigitalization {
  constructor(props: TreezorCardDigitalizationProps) {
    this.activationCode = props.activationCode
    this.activationCodeExpiry = new Date(props.activationCodeExpiry)
    this.activationMethod = Object.values(TreezorActivationMethod).find(
      (type) => type === props.activationMethod,
    )
    this.externalId = props.externalId
    this.cardId = props.cardId.toString()
    this.deviceName = props.deviceName
    this.deviceType = Object.values(TreezorDeviceType).find(
      (type) => type === props.deviceType,
    )
    this.expirationDate = new Date(props.expirationDate)
    this.tokenRequestor = props.tokenRequestor
  }

  activationCode: string
  activationCodeExpiry: Date
  activationMethod?: TreezorActivationMethod
  externalId: string
  cardId: string
  deviceName: string
  deviceType?: TreezorDeviceType
  expirationDate: Date
  tokenRequestor: string
}

export interface TreezorPayins {
  payins: TreezorPayin[]
}

export interface TreezorPayin {
  payinId: string
  amount: number
  payinStatus: string
  additionalData?: string
}

interface TreezorPayinAdditionalData {
  card: {
    externalProvider: {
      transactionReference: string
    }
  }
}

export function treezorPayinPropsToBaasPayinProps(
  payin: TreezorPayin,
): BaasPayinProps {
  let transactionReference: string | undefined
  if (!payin.additionalData || payin.additionalData == '') {
    transactionReference = undefined
  } else {
    try {
      transactionReference = (
        JSON.parse(payin.additionalData) as TreezorPayinAdditionalData
      ).card.externalProvider.transactionReference
    } catch (e) {
      transactionReference = (
        payin.additionalData as unknown as TreezorPayinAdditionalData
      ).card?.externalProvider?.transactionReference
    }
  }
  return {
    payinId: payin.payinId,
    amount: payin.amount,
    status: payin.payinStatus,
    transactionReference: transactionReference,
  }
}

export interface TreezorTopupCardProps {
  topupCardId: string
  token: string
  userId: string
  brand: string
  maskedPan: string
  cardHolder: string
  cardExpiryMonth: string
  cardExpiryYear: string
  issuer: string
  country: string
  domesticNetwork: string
  cardType: string
  createdDate: Date
  updatedDate: Date
  status: string
  providerName: string
  clientId: string
}

export class TreezorTopupCard {
  constructor(props: TreezorTopupCardProps) {
    this.topupCardId = new UUID(props.topupCardId)
    this.token = props.token
    this.userId = props.userId
    this.brand = props.brand
    this.maskedPan = props.maskedPan
    this.cardHolder = props.cardHolder
    this.cardExpiryMonth = props.cardExpiryMonth
    this.cardExpiryYear = props.cardExpiryYear
    this.issuer = props.issuer
    this.country = props.country
    this.domesticNetwork = props.domesticNetwork
    this.cardType = props.cardType
    this.createdDate = props.createdDate
    this.updatedDate = props.updatedDate
    this.status = props.status
    this.providerName = props.providerName
    this.clientId = props.clientId
  }
  topupCardId: UUID
  token: string
  userId: string
  brand: string
  maskedPan: string
  cardHolder: string
  cardExpiryMonth: string
  cardExpiryYear: string
  issuer: string
  country: string
  domesticNetwork: string
  cardType: string
  createdDate: Date
  updatedDate: Date
  status: string
  providerName: string
  clientId: string
}

export interface TreezorCardAuthorizationAdditionalData {
  card: {
    externalProvider: {
      transactionReference: string
      status: number
    }
  }
}

export interface TreezorCardAuthorizationProps {
  authorizationId: string
  walletId: string
  userId: string
  authorizationStatus: string
  messageToUser: string
  amount: string
  currency: string
  createdDate: Date
  walletEventName: string
  walletAlias: string
  userFirstname: string
  userLastname: string
  codeStatus: string
  informationStatus: string
  payinDate: Date
  additionalData: string
}

export class TreezorCardAuthorization {
  constructor(props: TreezorCardAuthorizationProps) {
    this.authorizationId = new UUID(props.authorizationId)
    this.walletId = props.walletId
    this.userId = props.userId
    this.authorizationStatus = props.authorizationStatus
    this.messageToUser = props.messageToUser
    this.amount = props.amount
    this.currency = props.currency
    this.createdDate = props.createdDate
    this.walletEventName = props.walletEventName
    this.walletAlias = props.walletAlias
    this.userFirstname = props.userFirstname
    this.userLastname = props.userLastname
    this.codeStatus = props.codeStatus
    this.informationStatus = props.informationStatus
    this.payinDate = props.payinDate

    const additionalData: TreezorCardAuthorizationAdditionalData = JSON.parse(
      props.additionalData,
    )
    this.transactionReference =
      additionalData.card.externalProvider.transactionReference
    this.status = hipayStatusToCardAcquisitionPayinStatus(
      additionalData.card.externalProvider.status,
    )
  }

  authorizationId: UUID
  walletId: string
  userId: string
  authorizationStatus: string
  messageToUser: string
  amount: string
  currency: string
  createdDate: Date
  walletEventName: string
  walletAlias: string
  userFirstname: string
  userLastname: string
  codeStatus: string
  informationStatus: string
  payinDate: Date
  transactionReference: string
  status: CardAcquisitionPayinStatus
}
