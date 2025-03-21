import { Body, Headers, Injectable, Post, Response } from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { logger } from '../../../../helpers/application.helper'
import { WebhookRepository } from '../../../../infrastructure/webhook-listener/database/webhook.repository'
import { BaasWebhookEntity } from '../../../../infrastructure/webhook-listener/entity/baas-webhook.entity'
import { WebhookEntity } from '../../../../infrastructure/webhook-listener/entity/webhook.entity'
import { WebhookSource } from '../../../../infrastructure/webhook-listener/entity/webhook.types'
import { TreezorWebhookGuard } from './treezor-webhook.guard'
import { TreezorWebhookPayload } from './treezor-webhook.types'

@Injectable()
export class TreezorWebhookBaseController {
  constructor(private readonly webhookRepo: WebhookRepository) {}

  @Post()
  @TreezorWebhookGuard()
  async handleTreezorWebhook(
    @Body() body: TreezorWebhookPayload<any>,
    @Response() resp: FastifyReply,
    @Headers('content-type') contentType: string,
  ) {
    const formattedBody: TreezorWebhookPayload<any> =
      contentType === 'text/plain; charset=UTF-8'
        ? JSON.parse(String(body))
        : body
    logger.log(
      `[${this.constructor.name}]: start action on treezor hook ${formattedBody.webhook}`,
    )

    //Store the Webhook
    try {
      await this.persistEvent(formattedBody)
    } catch (e) {
      logger.warn(
        `[${this.constructor.name}]: error while inserting event: ${e}`,
      )
    }

    return resp.status(200).send()
  }

  private async persistEvent(
    payload: TreezorWebhookPayload<any>,
  ): Promise<BaasWebhookEntity> {
    const eventToPersist: BaasWebhookEntity = WebhookEntity.create({
      source: WebhookSource.BAAS_WEBHOOK,
      // Conversion to miliseconds
      externalCreatedAt: new Date(Number(payload.webhook_created_at) * 0.1),
      externalId: payload.webhook_id,
      event: payload,
    })
    const eventSaved = await this.webhookRepo.save(eventToPersist)

    return eventSaved
  }
}
