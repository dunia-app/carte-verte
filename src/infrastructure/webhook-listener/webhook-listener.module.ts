import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CardDigitalizationCompletedWebhookHandler } from '../../modules/card/application/webhook-handlers/card-digitalization-completed.webhook-handler'
import { CardLockStatusUpdatedWebhookHandler } from '../../modules/card/application/webhook-handlers/card-lock-status-updated.webhook-handler'
import { CardUpdatedWebhookHandler } from '../../modules/card/application/webhook-handlers/card-updated.webhook-handler'
import { PinUnblockedWebhookHandler } from '../../modules/card/application/webhook-handlers/pin-unblocked.webhook-handler'
import { TransactionCreatedWebhookHandler } from '../../modules/transaction/application/webhook-handlers/transaction-created.webhook-handler'
import { AuthorizationCancelledWebhookHandler } from '../../modules/wallet/application/webhook-handlers/authorization-cancelled.webhook-handler'
import { AuthorizationCreatedWebhookHandler } from '../../modules/wallet/application/webhook-handlers/authorization-created.webhook-handler'
import { AuthorizationUpdatedWebhookHandler } from '../../modules/wallet/application/webhook-handlers/authorization-updated.webhook-handler'
import { PayinValidatedWebhookHandler } from '../../modules/wallet/application/webhook-handlers/payin-validated.webhook-handler'
import { HandleWebhookTaskHandler } from './application/task-handlers/handle-webhook.task-handler'
import { HandleWebhookCommandHandler } from './commands/handle-webhook/handle-webhook.command-handler'
import { HandleWebhookController } from './commands/handle-webhook/handle-webhook.task.controller'
import { WebhookOrmEntity } from './database/webhook.orm-entity'
import { WebhookRepository } from './database/webhook.repository'

const webhookHandlers = [
  // Baas
  AuthorizationCancelledWebhookHandler,
  AuthorizationCreatedWebhookHandler,
  AuthorizationUpdatedWebhookHandler,
  CardDigitalizationCompletedWebhookHandler,
  CardLockStatusUpdatedWebhookHandler,
  CardUpdatedWebhookHandler,
  PayinValidatedWebhookHandler,
  PinUnblockedWebhookHandler,
  TransactionCreatedWebhookHandler,
  ////
]

// const graphqlResolvers = []

const repositories = [WebhookRepository]

const commandHandlers = [HandleWebhookCommandHandler]

// const queryHandlers = []

const taskHandlers = [HandleWebhookTaskHandler]

const controllers = [HandleWebhookController]

@Module({
  imports: [TypeOrmModule.forFeature([WebhookOrmEntity]), CqrsModule],
  controllers: [...controllers],
  providers: [
    ...webhookHandlers,
    ...repositories,
    // ...graphqlResolvers,
    ...commandHandlers,
    // ...queryHandlers,
    ...taskHandlers,
  ],
  exports: [WebhookRepository],
})
export class WebhookListenerModule {}
