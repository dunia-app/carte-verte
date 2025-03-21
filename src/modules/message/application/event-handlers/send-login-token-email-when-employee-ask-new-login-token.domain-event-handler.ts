import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { EmployeeAskNewLoginTokenDomainEvent } from '../../../organization/domain/events/employee-ask-new-login-token.domain-event'
import { sendUserNewLoginToken } from '../../commands/send-user-new-login-token/send-user-new-login-token.message.service'

export class SendLoginTokenEmailWhenEmployeeAskNewLoginTokenDomainEventHandler extends DomainEventHandler {
  constructor(
    private readonly unitOfWork: UnitOfWork,
    readonly redis: RedisService,
    readonly configService: ConfigService,
  ) {
    super(EmployeeAskNewLoginTokenDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: EmployeeAskNewLoginTokenDomainEvent[]): Promise<void> {
    for (const event of events) {
      await sendUserNewLoginToken(
        this.unitOfWork,
        this.redis,
        this.configService,
        event,
      )
    }
  }
}
