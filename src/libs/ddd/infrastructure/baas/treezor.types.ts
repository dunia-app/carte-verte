import { toScale } from '../../../../helpers/math.helper'
import {
  PANEntryMethod,
  TransactionDeclinedReason,
  TransactionStatus,
} from '../../../../modules/transaction/domain/entities/transaction.types'

export enum TreezorUserType {
  PHYSICAL_USER_AND_ANONYMOUS_USER = 'PHYSICAL USER AND ANONYMOUS USER',
  BUSINESS_USER = 'BUSINESS USER',
  NON_GOVERNEMENTAL_ORGANIZATION = 'NON GOVERNEMENTAL ORGANIZATION',
  GOVERNEMENTAL_ORGANIZATION = 'GOVERNEMENTAL ORGANIZATION',
}

export enum TreezorUserTitle {
  M = 'M',
  MME = 'MME',
  MLLE = 'MLLE',
}

export function getUserTypeId(userType: TreezorUserType) {
  switch (userType) {
    case TreezorUserType.PHYSICAL_USER_AND_ANONYMOUS_USER:
      return 1
    case TreezorUserType.BUSINESS_USER:
      return 2
    case TreezorUserType.NON_GOVERNEMENTAL_ORGANIZATION:
      return 3
    case TreezorUserType.GOVERNEMENTAL_ORGANIZATION:
      return 4
    default:
      throw new Error(`Unknown userType: ${userType}`)
  }
}

export function transactionStatusToEnum(status: string): TransactionStatus {
  switch (status) {
    case 'A':
      return TransactionStatus.Accepted
    case 'R':
      return TransactionStatus.Refunded
    case 'S':
      return TransactionStatus.Settled
    case 'C':
      return TransactionStatus.Cleared
    case 'I':
      return TransactionStatus.Declined
    case 'V':
      return TransactionStatus.Reversed
    default:
      throw new Error('Unknown transactionStatus: ' + status)
  }
}

export function transactionStatusEnumToTreezorString(
  status: TransactionStatus,
): string {
  switch (status) {
    case TransactionStatus.Accepted:
      return 'A'
    case TransactionStatus.Refunded:
      return 'R'
    case TransactionStatus.Settled:
      return 'S'
    case TransactionStatus.Cleared:
      return 'C'
    case TransactionStatus.Declined:
      return 'I'
    case TransactionStatus.Reversed:
      return 'V'
    default:
      throw new Error('Unknown transactionStatus: ' + status)
  }
}

export function transactionResponseCodeToDeclinedReason(
  responseCode: string,
  responseNote: string,
): TransactionDeclinedReason | undefined {
  switch (responseCode) {
    case '61':
      if (responseNote.includes('LIMIT PAYMENT EXCEEDED DAY')) {
        return TransactionDeclinedReason.LIMIT_REACHED
      } else if (responseNote.includes('LIMIT PAYMENT EXCEEDED ALL')) {
        return TransactionDeclinedReason.INSUFFICIENT_FUNDS
      }
      return undefined
    case '03':
    case '57':
      return TransactionDeclinedReason.MERCHANT_INVALID
    case '41':
    case '43':
    case '02':
    case '54':
    case '83':
    case '62':
      return TransactionDeclinedReason.CARD_LOCKED
    case '63':
      if (
        responseNote.includes(
          'Card CVV2 not matching with cvv2 in auth request',
        )
      ) {
        return TransactionDeclinedReason.CVV_INCORRECT
      } else if (
        responseNote.includes(
          'DR: Card expiry check failed with Emboss Expiry date (DE014)',
        )
      ) {
        return TransactionDeclinedReason.EXP_DATE_INCORRECT
      }
      return undefined
    case '55':
      return TransactionDeclinedReason.PIN_INCORRECT
    case '5':
      if (responseNote.includes('DR: Requires SCA')) {
        return TransactionDeclinedReason.PIN_REQUIRED
      }
      return undefined
    case '75':
      return TransactionDeclinedReason.PIN_TRY_EXCEEDED
    default:
      return undefined
  }
}

export function getTreezorDate(
  paymentLocalTime: string,
  paymentLocalDate?: string,
): Date {
  const timeNumber = Number(paymentLocalTime)
  const hour = toScale(timeNumber / 10000, 0)
  const minute = toScale((timeNumber - hour * 10000) / 100, 0)
  const second = timeNumber % 100

  if (paymentLocalDate) {
    const dateNumber = Number(paymentLocalDate)
    const year = toScale(dateNumber / 10000, 0)
    const month = toScale((dateNumber - year * 10000) / 100, 0)
    const day = dateNumber % 100
    return new Date(year + 2000, month - 1, day, hour, minute, second)
  } else {
    const year = new Date().getFullYear()
    const month = new Date().getMonth()
    const day = new Date().getDate()
    const date = new Date(year, month, day, hour, minute, second)
    const yesterday = new Date(year, month, day - 1, hour, minute, second)
    // In case webhook is before midnight and this function is executed after midnight
    const diff1 = Math.abs(date.getTime() - new Date().getTime())
    const diff2 = Math.abs(yesterday.getTime() - new Date().getTime())
    return diff1 < diff2 ? date : yesterday
  }
}

export enum TreezorDeviceType {
  PHONE = 'PHONE',
  TABLET = 'TABLET',
  TABLET_OR_EREADER = 'TABLET_OR_EREADER',
  WATCH = 'WATCH',
  WATCH_OR_WRISTBAND = 'WATCH_OR_WRISTBAND',
  CARD = 'CARD',
  STICKER = 'STICKER',
  PC = 'PC',
  DEVICE_PERIPHERAL = 'DEVICE_PERIPHERAL',
  TAG = 'TAG',
  JEWELRY = 'JEWELRY',
  FASHION_ACCESSORY = 'FASHION_ACCESSORY',
  GARMENT = 'GARMENT',
  DOMESTIC_APPLIANCE = 'DOMESTIC_APPLIANCE',
  VEHICULE = 'VEHICULE',
  MEDIA_OR_GAMING_DEVICE = 'MEDIA_OR_GAMING_DEVICE',
  UNDEFINED = 'UNDEFINED',
}

export enum TreezorActivationMethod {
  TEXT_TO_CARDHOLDER_NUMBER = 'TEXT_TO_CARDHOLDER_NUMBER',
  EMAIL_TO_CARDHOLDER_ADDRESS = 'EMAIL_TO_CARDHOLDER_ADDRESS',
  CARDHOLDER_TO_CALL_AUTOMATED_NUMBER = 'CARDHOLDER_TO_CALL_AUTOMATED_NUMBER',
  CARDHOLDER_TO_CALL_MANNED_NUMBER = 'CARDHOLDER_TO_CALL_MANNED_NUMBER',
  CARDHOLDER_TO_VISIT_WEBSITE = 'CARDHOLDER_TO_VISIT_WEBSITE',
  CARDHOLDER_TO_USE_MOBILE_APP = 'CARDHOLDER_TO_USE_MOBILE_APP',
  ISSUER_TO_CALL_CARDHOLDER_NUMBER = 'ISSUER_TO_CALL_CARDHOLDER_NUMBER',
}

export enum TreezorCardDigitalizationStatus {
  SUSPEND = 'SUSPEND',
  UNSUSPEND = 'UNSUSPEND',
}

export enum TreezorCardDigitalizationReasonCodeUnsuspend {
  DEVICE_FOUND = 'DEVICE_FOUND',
  NO_FRAUDULENT_TRANSACTION = 'NO_FRAUDULENT_TRANSACTION',
  OTHER = 'OTHER',
}

export enum TreezorCardDigitalizationReasonCodeSuspendTemporarly {
  DEVICE_LOST = 'DEVICE_LOST',
  DEVICE_STOLEN = 'DEVICE_STOLEN',
  FRAUDULENT_TRANSACTION = 'FRAUDULENT_TRANSACTION',
  OTHER = 'OTHER',
}

export enum TreezorCardDigitalizationReasonCodeSuspendPermanently {
  DEVICE_LOST = 'DEVICE_LOST',
  DEVICE_STOLEN = 'DEVICE_STOLEN',
  FRAUDULENT_TRANSACTION = 'FRAUDULENT_TRANSACTION',
  ACCOUNT_CLOSED = 'ACCOUNT_CLOSED',
  OTHER = 'OTHER',
}

export function cardDigitalizationReasonCodeEnumToTreezorString(
  reasonCode:
    | TreezorCardDigitalizationReasonCodeUnsuspend
    | TreezorCardDigitalizationReasonCodeSuspendTemporarly
    | TreezorCardDigitalizationReasonCodeSuspendPermanently,
): string {
  switch (reasonCode) {
    case TreezorCardDigitalizationReasonCodeUnsuspend.DEVICE_FOUND:
      return 'F'
    case TreezorCardDigitalizationReasonCodeUnsuspend.NO_FRAUDULENT_TRANSACTION:
      return 'T'
    case TreezorCardDigitalizationReasonCodeUnsuspend.OTHER:
      return 'Z'
    case TreezorCardDigitalizationReasonCodeSuspendTemporarly.DEVICE_LOST:
      return 'L'
    case TreezorCardDigitalizationReasonCodeSuspendTemporarly.DEVICE_STOLEN:
      return 'S'
    case TreezorCardDigitalizationReasonCodeSuspendTemporarly.FRAUDULENT_TRANSACTION:
      return 'T'
    case TreezorCardDigitalizationReasonCodeSuspendTemporarly.OTHER:
      return 'Z'
    case TreezorCardDigitalizationReasonCodeSuspendPermanently.DEVICE_LOST:
      return 'L'
    case TreezorCardDigitalizationReasonCodeSuspendPermanently.DEVICE_STOLEN:
      return 'S'
    case TreezorCardDigitalizationReasonCodeSuspendPermanently.FRAUDULENT_TRANSACTION:
      return 'T'
    case TreezorCardDigitalizationReasonCodeSuspendPermanently.ACCOUNT_CLOSED:
      return 'C'
    case TreezorCardDigitalizationReasonCodeSuspendPermanently.OTHER:
      return 'Z'
    default:
      throw new Error('Unknown reasonCode: ' + reasonCode)
  }
}

export function getPANEntryMethod(panEntryMethod: number) {
  switch (Number(panEntryMethod)) {
    case 0:
      return PANEntryMethod.UNKNOWN_OR_NO_TERMINAL
    case 1:
      return PANEntryMethod.MANUAL_KEY_ENTRY
    case 2:
      return PANEntryMethod.PARTIAL_MAGNETIC_STRIPE_READ
    case 3:
      return PANEntryMethod.BARCODE
    case 4:
      return PANEntryMethod.OCR
    case 5:
      return PANEntryMethod.CHIP_CONTACT_INTERFACE
    case 7:
      return PANEntryMethod.CHIP_CONTACTLESS_INTERFACE
    case 10:
      return PANEntryMethod.CREDENTIAL_ON_FILE
    case 79:
      return PANEntryMethod.PAN_EXPIRATION_DATE_ENTERED_BY_ACQUIRER
    case 80:
      return PANEntryMethod.MAGNETIC_STRIPE_FALLBACK
    case 81:
      return PANEntryMethod.E_COMMERCE
    case 91:
      return PANEntryMethod.CONTACTLESS_MAGSTRIPE_MOD
    default:
      throw new Error(`Unknown panEntryMethod: ${panEntryMethod}`)
  }
}

export function dateToTreezorDateFormat(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}%3A${minutes}%3A${seconds}%2B00%3A02`
}
