import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common'
import crypto from 'crypto'
import { FastifyRequest } from 'fastify'
import { logger } from '../../../../helpers/application.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { WebhookRouteGeneric } from './treezor-webhook.types'

export function TreezorWebhookGuard(): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol, descriptor?: any) => {
    UseGuards(GuardTreezorWebhook)(target, propertyKey!, descriptor)
  }
}

@Injectable()
class GuardTreezorWebhook implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext) {
    const httpContext = context.switchToHttp()
    const request: FastifyRequest<WebhookRouteGeneric<any>> =
      httpContext.getRequest()

    const secret = this.configService.getStr('TREEZOR_WEBHOOK_SIGNATURE')
    logger.log(
      `[${
        this.constructor.name
      }]: treezor webhook received header ${JSON.stringify(request.headers)}`,
    )
    const body =
      request.headers['content-type'] === 'text/plain; charset=UTF-8'
        ? JSON.parse(String(request.body))
        : request.body
    logger.log(
      `[${this.constructor.name}]: treezor webhook received ${JSON.stringify(
        body,
      )}`,
    )
    logger.log(
      `[${this.constructor.name}]: start guard check for treezor webhook ${body.webhook}`,
    )
    if (!secret) {
      logger.error(`[${this.constructor.name}]: treezor secret was not found`)
      return false
    }
    const treezorSignature: string = body.object_payload_signature
    if (!treezorSignature) {
      logger.error(
        `[${this.constructor.name}]: treezor 'object_payload_signature' missing`,
      )
      throw new InternalServerErrorException()
    }

    // Compute the signature
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(encodeUTF8ToCodePoint(JSON.stringify(body.object_payload)))
      .digest('base64')
    // Check if signature in the webhook is equal to signature provided
    if (computedSignature !== body.object_payload_signature) {
      logger.error(`[${this.constructor.name}]: signature do not match`)
      // throw new InternalServerErrorException()
    }
    return true
  }
}

// declare a function to encode UTF-8 characters to their unicode sequence equivalent (\uxxxx)
function encodeUTF8ToCodePoint(s: string) {
  return s.replace(
    /[^\x20-\x7F]/g,
    (x) => '\\u' + ('000' + x.codePointAt(0)!.toString(16)).slice(-4),
  )
}
