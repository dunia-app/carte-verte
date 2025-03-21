import { registerEnumType } from '@nestjs/graphql'

export enum TransactionStatus {
  Accepted = 'Accepted',
  Refunded = 'Refunded',
  Settled = 'Settled',
  Cleared = 'Cleared',
  Declined = 'Declined',
  Reversed = 'Reversed',
}
export const transactionStatusEnumName = 'transaction_status_enum'

registerEnumType(TransactionStatus, { name: transactionStatusEnumName })

export const defaultTransactionStatusToDisplay = [
  TransactionStatus.Settled,
  TransactionStatus.Declined,
  TransactionStatus.Accepted,
]

export enum TransactionDeclinedReason {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  LIMIT_REACHED = 'LIMIT_REACHED',
  NOT_AVAILABLE_ON_SUNDAYS = 'NOT_AVAILABLE_ON_SUNDAYS',
  MERCHANT_INVALID = 'MERCHANT_INVALID',
  COUNTRY_INVALID = 'COUNTRY_INVALID',
  CARD_LOCKED = 'CARD_LOCKED',
  CVV_INCORRECT = 'CVV_INCORRECT',
  EXP_DATE_INCORRECT = 'EXP_DATE_INCORRECT',
  PIN_INCORRECT = 'PIN_INCORRECT',
  PIN_REQUIRED = 'PIN_REQUIRED',
  PIN_TRY_EXCEEDED = 'PIN_TRY_EXCEEDED',
}
export const transactionDeclinedReasonEnumName =
  'transaction_declined_reason_enum'

registerEnumType(TransactionDeclinedReason, {
  name: transactionDeclinedReasonEnumName,
})

export function declinedReasonToText(
  declinedReason?: TransactionDeclinedReason,
): string | undefined {
  switch (declinedReason) {
    case TransactionDeclinedReason.INSUFFICIENT_FUNDS:
      return 'car votre solde est insuffisant'
    case TransactionDeclinedReason.LIMIT_REACHED:
      return 'car votre limite quotidienne a été atteinte'
    case TransactionDeclinedReason.NOT_AVAILABLE_ON_SUNDAYS:
      return "car vous n'êtes pas autorisé à utiliser vos titres restaurant un dimanche ou jour férié"
    case TransactionDeclinedReason.MERCHANT_INVALID:
      return "car ce commerçant n'est pas éligible à l'expérimentation Carte Verte"
    case TransactionDeclinedReason.COUNTRY_INVALID:
      return 'car votre titre restaurant ne sont uilisable en France uniquement'
    case TransactionDeclinedReason.CARD_LOCKED:
      return 'car votre card est bloqué'
    case TransactionDeclinedReason.CVV_INCORRECT:
      return 'car le CVV entré est incorrect'
    case TransactionDeclinedReason.EXP_DATE_INCORRECT:
      return "car la date d'expiration entré est incorrect"
    case TransactionDeclinedReason.PIN_INCORRECT:
      return 'car le code PIN entré est incorrect'
    case TransactionDeclinedReason.PIN_REQUIRED:
      return 'car le paiement nécessite de saisir son code PIN'
    case TransactionDeclinedReason.PIN_TRY_EXCEEDED:
      return "car votre code PIN est bloqué après trop d'essais. Rendez-vous page Carte pour le débloquer"
    default:
      return ''
  }
}

export enum PANEntryMethod {
  UNKNOWN_OR_NO_TERMINAL = 'UNKNOWN_OR_NO_TERMINAL',
  MANUAL_KEY_ENTRY = 'MANUAL_KEY_ENTRY',
  PARTIAL_MAGNETIC_STRIPE_READ = 'PARTIAL_MAGNETIC_STRIPE_READ',
  BARCODE = 'BARCODE',
  OCR = 'OCR',
  CHIP_CONTACT_INTERFACE = 'CHIP_CONTACT_INTERFACE',
  CHIP_CONTACTLESS_INTERFACE = 'CHIP_CONTACTLESS_INTERFACE',
  CREDENTIAL_ON_FILE = 'CREDENTIAL_ON_FILE',
  PAN_EXPIRATION_DATE_ENTERED_BY_ACQUIRER = 'PAN_EXPIRATION_DATE_ENTERED_BY_ACQUIRER',
  MAGNETIC_STRIPE_FALLBACK = 'MAGNETIC_STRIPE_FALLBACK',
  E_COMMERCE = 'E_COMMERCE',
  CONTACTLESS_MAGSTRIPE_MOD = 'CONTACTLESS_MAGSTRIPE_MOD',
}
