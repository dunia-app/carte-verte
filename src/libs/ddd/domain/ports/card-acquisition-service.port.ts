import cryptoRandomString from 'crypto-random-string'
import { CardAcquisitionPayinStatus } from '../../../../modules/wallet/domain/entities/card-acquisition-payin.types'
import { ExceptionBase } from '../../../exceptions/index'
import { Result } from '../utils/result.util'

export enum PayinOperation {
  capture = 'capture',
  refund = 'refund',
  cancel = 'cancel',
  acceptChallenge = 'acceptChallenge',
  denyChallenge = 'denyChallenge',
}

export interface CardAcquisitionPayinResult {
  reference: string
  externalAuthorizationId: string
  status: CardAcquisitionPayinStatus
}

export interface CardAcquisitionResult {
  token: string
  maskedPan: string
  reference: string
  paymentProduct: string
  status: CardAcquisitionPayinStatus
}

export interface CardAcquisitionLinkResult {
  url: string
  orderId: string
}

export interface CardAcquisitionServicePort {
  requestCardAcquisitionLink(
    externalCardAcquisitionId: string,
    externalEmployeeId: string,
  ): Promise<Result<CardAcquisitionLinkResult, CardAcquisitionServiceError>>
  getExternalCardAcquisitionId(orderId: string): string
  getCardAcquisition(
    externalCardAcquisitionId: string,
    externalEmployeeId: string,
  ): Promise<Result<CardAcquisitionResult, CardAcquisitionServiceError>>
  updateCardAcquisitionAmount(
    externalEmployeeId: string,
    externalCardToken: string,
    amount: number,
    transactionReference: string,
    paymentProduct: string,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>>
  cancelCardAcquisition(
    externalEmployeeId: string,
    externalCardToken: string,
    transactionReference: string,
  ): Promise<Result<boolean, CardAcquisitionServiceError>>
  authorizePayin(
    externalEmployeeId: string,
    externalCardToken: string,
    amount: number,
    paymentProduct: string,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>>
  directPayin(
    externalEmployeeId: string,
    externalCardToken: string,
    amount: number,
    paymentProduct: string,
    description?: string,
  ): Promise<Result<CardAcquisitionPayinResult, CardAcquisitionServiceError>>
  cancelPayin(
    externalCardTransactionReference: string,
  ): Promise<Result<string, CardAcquisitionServiceError>>
  capturePayin(
    externalCardTransactionReference: string,
    amount: number,
  ): Promise<Result<string, CardAcquisitionServiceError>>
  getCardTransactionStatus(
    externalId: string,
  ): Promise<Result<string, CardAcquisitionServiceError>>
}

export function generateExternalCardAcquisitionId(
  externalEmployeeId: string,
): string {
  return cryptoRandomString({
    length: 25 - externalEmployeeId.length,
    type: 'numeric',
  })
}

export function generateExternalCardAcquisitionIdV2(): string {
  return cryptoRandomString({
    length: 21,
    type: 'numeric',
  })
}

export function getOrderId(
  externalCardAcquisitionId: string,
  externalEmployeeId: string,
): string {
  return `${externalEmployeeId}_order_${externalCardAcquisitionId}`
}

export function getOrderIdV2(externalCardAcquisitionId: string): string {
  return `ekip_order_${externalCardAcquisitionId}`
}

export class CardAcquisitionServiceError extends ExceptionBase {
  static readonly message = 'Card acquisition service returned an error.'

  public readonly code: string = 'CARD_ACQUISITION_SERVICE.ERROR'

  constructor(metadata?: unknown) {
    super(CardAcquisitionServiceError.message, metadata)
  }
}
