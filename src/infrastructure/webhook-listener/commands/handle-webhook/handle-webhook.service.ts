import { logger } from '../../../../helpers/application.helper'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { TreezorWebhookType } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.types'
import { ExceptionBase } from '../../../../libs/exceptions'
import { UnitOfWork } from '../../../database/unit-of-work/unit-of-work'
import { WebhookHandler } from '../../application/webhook-handlers/webhook-handler'
import { WebhookRepositoryPort } from '../../database/webhook.repository.port'
import { WebhookSource } from '../../entity/webhook.types'
import { HandleWebhookCommand } from './handle-webhook.command'
import { PossibleWebhookType } from './handle-webhook.command-handler'

export async function handleWebhook(
  command: HandleWebhookCommand,
  unitOfWork: UnitOfWork,
  handleWebhooks: {
    [key in PossibleWebhookType]?: WebhookHandler<any>
  },
): Promise<Result<boolean, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
  //    atomic database transaction */
  const webhookRepo: WebhookRepositoryPort = unitOfWork.getWebhookRepository(
    command.correlationId,
  )

  // Check we know webhook type
  let eventType
  let event
  let objectId: string
  switch (command.source) {
    case WebhookSource.BAAS_WEBHOOK:
      eventType = Object.values(TreezorWebhookType).find(
        (type) => type === command.eventType,
      )
      event = command.webhook.event.object_payload
      objectId = command.webhook.event.object_id
      break
    default:
      throw new Error('Unknown webhook source')
  }

  if (!eventType) {
    command.webhook.handleEvent(true)
    await webhookRepo.save(command.webhook)
    return Result.ok(true)
  }
  // Check we have an handler for it
  const handler = handleWebhooks[eventType]
  if (!handler) {
    command.webhook.handleEvent(true)
    await webhookRepo.save(command.webhook)
    return Result.ok(true)
  }

  // Handle each event separately for now
  logger.info(
    `[handleWebhook]: Start webhook handling ${command.correlationId}`,
  )
  logger.info(`[handleWebhook]: Webhook command.eventType ${command.eventType}`)
  logger.info(`[handleWebhook]: Webhook eventType ${eventType}`)
  logger.info(`[handleWebhook]: Webhook handler ${handler.constructor.name}`)
  const eventResult = await handler.handle(objectId, event)
  logger.info(`[handleWebhook]: Stop webhook handling ${command.correlationId}`)
  command.webhook.handleEvent(eventResult)
  logger.info(`[handleWebhook]: Start webhook saving ${command.correlationId}`)
  await webhookRepo.save(command.webhook)
  logger.info(`[handleWebhook]: Stop webhook saving ${command.correlationId}`)
  return Result.ok(true)
}
