import { CommandHandler } from '@nestjs/cqrs'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { TreezorWebhookType } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.types'
import { CardDigitalizationCompletedWebhookHandler } from '../../../../modules/card/application/webhook-handlers/card-digitalization-completed.webhook-handler'
import { CardLockStatusUpdatedWebhookHandler } from '../../../../modules/card/application/webhook-handlers/card-lock-status-updated.webhook-handler'
import { CardUpdatedWebhookHandler } from '../../../../modules/card/application/webhook-handlers/card-updated.webhook-handler'
import { PinUnblockedWebhookHandler } from '../../../../modules/card/application/webhook-handlers/pin-unblocked.webhook-handler'
import { TransactionCreatedWebhookHandler } from '../../../../modules/transaction/application/webhook-handlers/transaction-created.webhook-handler'
import { AuthorizationCancelledWebhookHandler } from '../../../../modules/wallet/application/webhook-handlers/authorization-cancelled.webhook-handler'
import { AuthorizationCreatedWebhookHandler } from '../../../../modules/wallet/application/webhook-handlers/authorization-created.webhook-handler'
import { AuthorizationUpdatedWebhookHandler } from '../../../../modules/wallet/application/webhook-handlers/authorization-updated.webhook-handler'
import { PayinValidatedWebhookHandler } from '../../../../modules/wallet/application/webhook-handlers/payin-validated.webhook-handler'
import { UnitOfWork } from '../../../database/unit-of-work/unit-of-work'
import { WebhookHandler } from '../../application/webhook-handlers/webhook-handler'
import { HandleWebhookCommand } from './handle-webhook.command'
import { handleWebhook } from './handle-webhook.service'

export type PossibleWebhookType = TreezorWebhookType

@CommandHandler(HandleWebhookCommand)
export class HandleWebhookCommandHandler extends CommandHandlerBase {
  handleWebhooks: {
    [key in PossibleWebhookType]?: WebhookHandler<any>
  }
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    readonly transactionCreatedWebhookHandler: TransactionCreatedWebhookHandler,
    readonly cardDigitalizationCompletedWebhookHandler: CardDigitalizationCompletedWebhookHandler,
    readonly cardLockStatusUpdatedWebhookHandler: CardLockStatusUpdatedWebhookHandler,
    readonly cardUpdatedWebhookHandler: CardUpdatedWebhookHandler,
    readonly cardPinUnblockedWebhookHandler: PinUnblockedWebhookHandler,
    readonly payinValidatedWebhookHandler: PayinValidatedWebhookHandler,
    readonly authorizationCreatedWebhookHandler: AuthorizationCreatedWebhookHandler,
    readonly authorizationUpdatedWebhookHandler: AuthorizationUpdatedWebhookHandler,
    readonly authorizationCancelledWebhookHandler: AuthorizationCancelledWebhookHandler,
  ) {
    super(unitOfWork)
    this.handleWebhooks = {
      [TreezorWebhookType.CARDTRANSACTION_CREATE]:
        transactionCreatedWebhookHandler,
      [TreezorWebhookType.CARDDIGITALIZATION_COMPLETE]:
        cardDigitalizationCompletedWebhookHandler,
      [TreezorWebhookType.CARD_LOCKUNLOCK]: cardLockStatusUpdatedWebhookHandler,
      [TreezorWebhookType.CARD_UPDATE]: cardUpdatedWebhookHandler,
      [TreezorWebhookType.PAYIN_UPDATE]: payinValidatedWebhookHandler,
      [TreezorWebhookType.AUTHORIZATION_CREATE]:
        authorizationCreatedWebhookHandler,
      [TreezorWebhookType.AUTHORIZATION_UPDATE]:
        authorizationUpdatedWebhookHandler,
      [TreezorWebhookType.AUTHORIZATION_CANCEL]:
        authorizationCancelledWebhookHandler,
      [TreezorWebhookType.CARD_UNBLOCKPIN]: cardPinUnblockedWebhookHandler,
    }
  }

  protected logTransaction: boolean = false

  async handle(command: HandleWebhookCommand) {
    return handleWebhook(command, this.unitOfWork, this.handleWebhooks)
  }
}
