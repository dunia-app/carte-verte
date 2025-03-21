import Stripe from 'stripe'

export type CheckoutSessionCompletedWebhookPayload = Stripe.Checkout.Session
export type CheckoutSessionExpiredWebhookPayload = Stripe.Checkout.Session
