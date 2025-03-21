import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UseGuards,
} from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import Stripe from 'stripe'
import { logger } from '../../../../helpers/application.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { WebhookRouteGeneric } from './stripe-webhook.types'

export function StripeWebhookGuard(): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol, descriptor?: any) => {
    UseGuards(GuardStripeWebhook)(target, propertyKey!, descriptor)
  }
}

@Injectable()
class GuardStripeWebhook implements CanActivate {
  private readonly stripe: Stripe
  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    const stripeKey = this.configService.getStr('STRIPE_API_KEY')
    // Use latest API version by default
    this.stripe = new Stripe(stripeKey)
  }

  async canActivate(context: ExecutionContext) {
    const httpContext = context.switchToHttp()
    const request: FastifyRequest<WebhookRouteGeneric<any>> =
      httpContext.getRequest()
    logger.log(
      `${
        this.constructor.name
      }: stripe webhook received header ${JSON.stringify(request.headers)}`,
    )
    const body =
      request.headers['content-type'] === 'text/plain; charset=UTF-8'
        ? JSON.parse(String(request.body))
        : request.body
    logger.log(
      `[${this.constructor.name}]: stripe webhook received ${JSON.stringify(
        body,
      )}`,
    )

    const secret = this.configService.getStr('STRIPE_WEBHOOK_SIGNATURE')
    if (!secret) {
      logger.error(`[${this.constructor.name}]: stripe secret was not found`)
      return false
    }

    const sig = request.headers['stripe-signature']!
    if (!sig) {
      logger.error(
        `[${this.constructor.name}]: stripe 'stripe-signature' missing`,
      )
      return false
    }

    try {
      this.stripe.webhooks.constructEvent(
        httpContext.getRequest().rawBody.toString(),
        sig,
        secret,
        10,
      )
    } catch (err) {
      logger.error(
        `[${this.constructor.name}]: signature do not match : ${err}`,
      )
      return false
    }
    return true
  }
}