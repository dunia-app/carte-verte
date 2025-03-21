import {
  TreezorCard,
  TreezorCardAuthorizationProps,
  TreezorCardDigitalizationProps,
  TreezorPayin,
  TreezorTopupCardProps,
  TreezorTransactionProps,
} from './treezor.entity'

export interface TransactionCreatedWebhookPayload {
  cardtransactions: TreezorTransactionProps[]
}

export type CardDigitalizationCompletedWebhookPayload =
  TreezorCardDigitalizationProps

export interface CardLockStatusUpdatedWebhookPayload {
  cards: TreezorCard[]
}

export interface CardUpdatedWebhookPayload {
  cards: TreezorCard[]
}

export interface PinUnblockedWebhookPayload {
  cards: TreezorCard[]
}

export interface PayinUpdatedWebhookPayload {
  payins: TreezorPayin[]
}

export interface AuthorizationUpdatedWebhookPayload {
  authorizations: TreezorCardAuthorizationProps[]
}

export interface TopupCardValidatedWebhookPayload {
  topupCards: TreezorTopupCardProps[]
}
