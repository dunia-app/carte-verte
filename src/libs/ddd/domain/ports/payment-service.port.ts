import { ExceptionBase } from '../../../exceptions/index'
import { Result } from '../utils/result.util'

export enum ProductName {
  PHYSICAL_CARD = 'PHYSICAL_CARD',
}

export interface PaymentServicePort {
  getPayment(
    product: ProductName,
    price: number,
  ): Promise<Result<Payment, GetPaymentUrlError>>
}

export interface Payment {
  url: string
  id: string
}

export function getProductLabelFromProductName(product: ProductName) {
  switch (product) {
    case ProductName.PHYSICAL_CARD:
      return 'Carte Ekip Physique'
  }
}

export function getProductImageFromProductName(product: ProductName) {
  switch (product) {
    case ProductName.PHYSICAL_CARD:
      return 'https://storage.googleapis.com/categories_icons/ekip-blank-card.png'
  }
}

export class GetPaymentUrlError extends ExceptionBase {
  static readonly message = 'Unable to get a payment url from payment service'

  public readonly code: string = 'GET_PAYMENT_ULR.ERROR'

  constructor(metadata?: unknown) {
    super(GetPaymentUrlError.message, metadata)
  }
}
