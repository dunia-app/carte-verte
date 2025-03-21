import { CardAcquisitionPayinStatus } from '../../../../modules/wallet/domain/entities/card-acquisition-payin.types'

export interface HipayHpayment {
  forwardUrl: string
  mid: string
  order: HipayOrder
}

export interface HipayTransaction {
  mid: string
  authorizationCode: string
  transactionReference: string
  dateCreated: string
  dateUpdated: string
  dateAuthorized: string
  status: number
  state: string
  message: string
  authorizedAmount: number
  capturedAmount: number
  refundedAmount: number
  decimals: number
  currency: string
  reason: any
  forwardUrl: string
  attemptId: string
  referenceToPay: string
  ipAddress: string
  ipCountry: string
  deviceId: string
  avsResult: string
  cvcResult: string
  eci: string
  paymentProduct: string
  paymentMethod: HipayPaymentMethod
  threeDSecure: any
  fraudScreening: any
  order: HipayOrder
  debitAgreement: any
  basket: any
  operation: any
  customData: any
}

export interface HipayTransactionResponse {
  transaction: { [key: string]: HipayTransaction } | HipayTransaction
}

export function isHipayTransaction(
  transaction: any,
): transaction is HipayTransaction {
  return (
    typeof transaction === 'object' &&
    transaction !== null &&
    'transactionReference' in transaction &&
    'status' in transaction &&
    'state' in transaction
  )
}

export interface HipayPaymentMethod {
  token: string
  brand: string
  pan: string
  cardHolder: string
  cardExpiryMonth: string
  cardExpiryYear: string
  cardId: string
  issuer: string
  country: string
}

export interface HipayOrder {
  id: string
  customerId: string
  amount: number
  tax: number
  shipping: number
  dateCreated: string
  attempts: number
  currency: string
  decimals: number
  gender: string
  language: string
  shippingAddress: any
}

// Status	Message	Description
// 109	Authentication Failed	The cardholder’s authentication failed.The authorization request should not be submitted.An authentication failure may be a possible indication of a fraudulent user.
// 110	Blocked	The transaction has been rejected for reasons of suspected fraud.
// 111	Denied	The merchant denied the payment attempt. After reviewing the fraud screening result, the merchant decided to decline the payment.
// 112	Authorized and Pending	The payment has been challenged by the fraud rule set and is pending.
// 113	Refused	The financial institution refused to authorize the payment.The refusal reasons can be: an exceeded credit limit, an incorrect expiry date or insufficient balance, or many others, depending on the selected payment method.
// 114	Expired	The validity period of the payment authorization has expired.This happens when no capture request is submitted for an authorized payment typically within 7 days after authorization.Note: Depending on the customer’s issuing bank, the authorization validity period may last from 1 to 5 days for a debit card and up to 30 days for a credit card.
// 115	Cancelled	The merchant has cancelled the payment attempt.Only payments with status “Authorized” that have not yet reached the status “Captured” can be cancelled. In case of a credit card payment, cancelling the transaction consists in voiding the authorization.
// 116	Authorized	The financial institution has approved the payment.In the case of a credit card payment, funds are “held” and deducted from the customer’s credit limit (or bank balance, in the case of a debit card), but are not yet transferred to the merchant. In the case of bank transfers and some other payment methods, the payment immediately reaches the “Captured” status after being set to “Authorized”.
// 117	Capture Requested	A capture request has been sent to the financial institution.
// 118	Captured	The financial institution has processed the payment.The funds will be transferred to HiPay Enterprise before being settled to your bank account. Authorized payments can be captured as long as the authorization has not expired. Some payment methods, like bank transfers or direct debits, reach the “Captured” status straight away after being authorized.
// 119	Partially Captured	The financial institution has processed part of the payment.If only part of the order can be shipped, it is allowed to capture an amount equal to the shipped part of the order. This is called a partial capture.Please note: As dictated by all credit card companies, it is not allowed for a merchant to capture a payment before shipping has been completed. Merchants should start shipping the order once the status “Authorized” has been reached!
// 124	Refund Requested	A refund request has been sent to the financial institution.
// 125	Refunded	The payment was refunded.A payment reaches the “Refunded” status when the financial institution has processed the refund and the amount has been transferred to the customer’s account. The amount will be deducted from the next total amount to be paid out to the merchant.
// 126	Partially Refunded	The payment was partially refunded.
// 129	Charged Back	The payment was charged back.The cardholder has reversed a capture processed by their bank or credit card company. For instance, the cardholder has contacted their credit card company and denied having made the transaction. The credit card company has then revoked the payment already captured. Please note the legal difference between the customer (who ordered the goods) and the cardholder (who owns the credit card and ends up paying for the order).Generally, chargebacks only occur incidentally. When they do, contacting the customer can often solve the situation. Occasionally, it is an indication of credit card fraud.
// 134	Dispute lost	The merchant lost the chargeback dispute. The chargeback has already been applied to the transaction, it still applies and thus will be not refunded.
// 142	Authorization Requested	The payment method used requires an authorization request; the request was sent and the system is waiting for the approval of the financial institution.
// 143	Authorization Cancelled	The authorization has been cancelled
// 144	Reference rendered	The payment reference to pay has been generated
// 165	Refund Refused	The refund operation was refused by the financial institution.
// 166	Debited (cardholder credit)	The credit request was accepted and the cardholder was credited of the requested amount.
// 168	 Debited (cardholder credit)	The credit request was accepted and the cardholder was credited of the requested amount.
// 169	Credit requested	The merchant requested to directly credit the cardholder.
// 172	In progress	This status only applies to MixPayment master transactions. All of the master transaction’s sub-transactions are not yet authorized. Consequently, the order’s full amount has not yet been fully paid.
// 173	Capture Refused	The capture was refused by the financial institution.
// 174	Awaiting Terminal	The transaction request was sent to the payment terminal.
// 175	Authorization cancellation requested	The merchant requested to cancel the transaction’s authorization.
// 177	Challenge Requested	The payment method used requires authentication; authentication request has been sent and the system is waiting for an action from the customer.
// 178	Soft declined	The authorization was declined by the issuer because the transaction was not authenticated. You may retry the authorization after authenticating the cardholder.
// 200	Pending Payment	The transaction request was submitted to the acquirer but the response is not yet available.
export function hipayStatusToCardAcquisitionPayinStatus(
  status: number,
): CardAcquisitionPayinStatus {
  switch (Number(status)) {
    case 112:
    case 140:
    case 142:
    case 172:
    case 174:
    case 177:
    case 200:
      return CardAcquisitionPayinStatus.Pending
    case 116:
    case 117:
      return CardAcquisitionPayinStatus.Authorized
    case 118:
    case 119:
    case 124:
      return CardAcquisitionPayinStatus.Captured
    case 125:
    case 126:
      return CardAcquisitionPayinStatus.Refunded
    default:
      return CardAcquisitionPayinStatus.Failed
  }
}
