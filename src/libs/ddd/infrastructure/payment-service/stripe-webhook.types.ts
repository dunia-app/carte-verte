import { RouteGenericInterface } from 'fastify'
import Stripe from 'stripe'

export interface WebhookRouteGeneric<
  PayloadType extends Stripe.Event.Data.Object,
> extends RouteGenericInterface {
  Body: StripeWebhookPayload<PayloadType>
}

export interface StripeWebhookPayload<
  PayloadType extends Stripe.Event.Data.Object,
> extends Stripe.EventBase {
  readonly data: { object: PayloadType }
}

export enum StripeWebhookType {
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
  CHECKOUT_SESSION_EXPIRED = 'checkout.session.expired',
}