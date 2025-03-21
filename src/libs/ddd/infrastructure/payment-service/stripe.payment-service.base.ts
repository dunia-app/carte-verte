import { Result } from '@badrap/result'
import Stripe from 'stripe'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import {
  GetPaymentUrlError,
  getProductImageFromProductName,
  getProductLabelFromProductName,
  Payment,
  PaymentServicePort,
  ProductName,
} from '../../domain/ports/payment-service.port'

export class StripePaymentService implements PaymentServicePort {
  private readonly config: ConfigService
  private readonly stripe: Stripe
  private readonly successUrl: string
  private readonly cancelledUrl: string
  constructor() {
    this.config = new ConfigService()
    const stripeKey = this.config.getStr('STRIPE_API_KEY')
    this.successUrl = this.config.getStr('STRIPE_SUCCESS_URL')
    this.cancelledUrl = this.config.getStr('STRIPE_CANCELED_URL')
    // Use latest API version by default
    this.stripe = new Stripe(stripeKey)
  }

  async getPayment(
    product: ProductName,
    price: number,
  ): Promise<Result<Payment, GetPaymentUrlError>> {
    const params = {
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            product_data: {
              name: getProductLabelFromProductName(product),
              images: [getProductImageFromProductName(product)],
            },
            unit_amount: price * 100,
          },
        },
      ],
      mode: 'payment',
      success_url: `${this.successUrl}?success=true`,
      cancel_url: `${this.cancelledUrl}?canceled=true`,
    } as Stripe.Checkout.SessionCreateParams

    try {
      const session = await this.stripe.checkout.sessions.create(params)

      if (!session.url) {
        return Result.err(new GetPaymentUrlError())
      }
      return Result.ok({
        id: session.id,
        url: session.url,
      })
    } catch (e) {
      return Result.err(new GetPaymentUrlError(e))
    }
  }
}