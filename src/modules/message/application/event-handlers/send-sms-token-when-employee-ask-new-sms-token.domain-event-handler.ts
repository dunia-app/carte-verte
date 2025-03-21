import { ConfigService } from '../../../../infrastructure/config/config.service'
import { MessageEmitter } from '../../../../infrastructure/message-emitter/message-emitter'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { SmsEmitter } from '../../../../infrastructure/sms-emitter/sms-emitter'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { EmployeeAskNewSmsTokenDomainEvent } from '../../../organization/domain/events/employee-ask-new-sms-token.domain-event'
import { sendUserNewSmsToken } from '../../commands/send-user-new-sms-token/send-user-new-sms-token.service'

export class SendSmsTokenWhenEmployeeAskNewSmsTokenDomainEventHandler extends DomainEventHandler {
  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly smsEmitter: SmsEmitter,
    private readonly messageEmitter: MessageEmitter,
  ) {
    super(EmployeeAskNewSmsTokenDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: EmployeeAskNewSmsTokenDomainEvent[]): Promise<void> {
    for (const event of events) {
      await sendUserNewSmsToken(
        this.redis,
        this.config,
        this.smsEmitter,
        this.messageEmitter,
        event,
      )
    }
  }
}
