import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { WebhookEntity } from '../../entity/webhook.entity'
import { WebhookSource } from '../../entity/webhook.types'

// Command is a plain object with properties
export class HandleWebhookCommand extends Command<number, ExceptionBase> {
  constructor(props: CommandProps<HandleWebhookCommand>) {
    super(props)
    this.source = props.source
    this.eventType = props.eventType
    this.webhook = props.webhook
  }

  readonly source: WebhookSource

  readonly eventType: string

  readonly webhook: WebhookEntity<any>
}
