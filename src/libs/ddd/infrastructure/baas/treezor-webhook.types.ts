import { RouteGenericInterface } from 'fastify'

export interface WebhookRouteGeneric<PayloadType>
  extends RouteGenericInterface {
  Body: TreezorWebhookPayload<PayloadType>
}
export interface TreezorWebhookPayload<PayloadType> {
  readonly webhook: string
  readonly webhook_id: string
  readonly webhook_created_at: string
  readonly object: string
  readonly object_id: string
  readonly object_payload: PayloadType
  readonly object_payload_signature: string
}

export enum TreezorWebhookType {
  AUTHORIZATION_CREATE = 'authorization.create',
  AUTHORIZATION_UPDATE = 'authorization.update',
  AUTHORIZATION_CANCEL = 'authorization.cancel',
  // BALANCE_UPDATE = "balance.update",
  // BENEFICIARY_CREATE = "beneficiary.create",
  // BENEFICIARY_UPDATE = "beneficiary.update",
  // SEPA_RETURN_SCTR = "sepa.return_sctr",
  // RECALLR_NEED_RESPONSE = "recallr.need_response",
  // CARD_REQUESTPHYSICAL = "card.requestphysical",
  CARD_CREATEVIRTUAL = 'card.createvirtual',
  CARD_CONVERTVIRTUAL = 'card.convertvirtual',
  CARD_CHANGEPIN = 'card.changepin',
  CARD_ACTIVATE = 'card.activate',
  // CARD_RENEW = "card.renew",
  // CARD_REGENERATE = "card.regenerate",
  CARD_UPDATE = 'card.update',
  // CARD_LIMITS = "card.limits",
  // CARD_OPTIONS = "card.options",
  CARD_SETPIN = 'card.setpin',
  CARD_UNBLOCKPIN = 'card.unblockpin',
  CARD_LOCKUNLOCK = 'card.lockunlock',
  // CARDDIGITALIZATION_UPDATE = 'cardDigitalization.update',
  // CARDDIGITALIZATION_ACTIVATION = 'cardDigitalization.activation',
  CARDDIGITALIZATION_COMPLETE = 'cardDigitalization.complete',
  CARDTRANSACTION_CREATE = 'cardtransaction.create',
  // CARD_ACQUIRING = "card.acquiring",
  // COUNTRYGROUP_CREATE = "countrygroup.create",
  // COUNTRYGROUP_UPDATE = "countrygroup.update",
  // COUNTRYGROUP_CANCEL = "countrygroup.cancel",
  // DOCUMENT_CREATE = "document.create",
  // DOCUMENT_UPDATE = "document.update",
  // DOCUMENT_CANCEL = "document.cancel",
  // MANDATE_CREATE = "mandate.create",
  // MANDATE_CANCEL = "mandate.cancel",
  // MCCGROUP_CREATE = "mccgroup.create",
  MCCGROUP_UPDATE = 'mccgroup.update',
  // MCCGROUP_CANCEL = "mccgroup.cancel",
  // MERCHANTIDGROUP_CREATE = "merchantidgroup.create",
  MERCHANTIDGROUP_UPDATE = 'merchantidgroup.update',
  // MERCHANTIDGROUP_CANCEL = "merchantidgroup.cancel",
  // SEPA_REJECT_SDDE = "sepa.reject_sdde",
  // SEPA_RETURN_SDDR = "sepa.return_sddr",
  // SEPA_REJECT_SDDR_CORE = "sepa.reject_sddr_core",
  // SEPA_REJECT_SDDR_B2B = "sepa.reject_sddr_b2b",
  PAYIN_CREATE = 'payin.create',
  PAYIN_UPDATE = 'payin.update',
  PAYIN_CANCEL = 'payin.cancel',
  PAYIN_DEFAULTED = 'payin.defaulted',
  // PAYINREFUND_CREATE = "payinrefund.create",
  // PAYINREFUND_UPDATE = "payinrefund.update",
  // PAYINREFUND_CANCEL = "payinrefund.cancel",
  PAYOUT_CREATE = 'payout.create',
  PAYOUT_UPDATE = 'payout.update',
  PAYOUT_CANCEL = 'payout.cancel',
  // PAYOUTREFUND_CREATE = 'payoutrefund.create',
  // PAYOUTREFUND_UPDATE = 'payoutrefund.update',
  // PAYOUTREFUND_CANCEL = 'payoutrefund.cancel',
  // TRANSACTION_CREATE = "transaction.create",
  // TRANSFER_CREATE = "transfer.create",
  // TRANSFER_UPDATE = "transfer.update",
  // TRANSFER_CANCEL = "transfer.cancel",
  // TRANSFERREFUND_CREATE = "transferrefund.create",
  // TRANSFERREFUND_UPDATE = "transferrefund.update",
  // TRANSFERREFUND_CANCEL = "transferrefund.cancel",
  USER_CREATE = 'user.create',
  USER_UPDATE = 'user.update',
  USER_CANCEL = 'user.cancel',
  // USER_KYCREVIEW = "user.kycreview",
  // USER_KYCREQUEST = "user.kycrequest",
  // KYVLIVENESS_CREATE = "kyvliveness.create",
  // KYVLIVENESS_UPDATE = "kyvliveness.update",
  // WALLET_CREATE = "wallet.create",
  // WALLET_UPDATE = "wallet.update",
  // WALLET_CANCEL = "wallet.cancel"
}
