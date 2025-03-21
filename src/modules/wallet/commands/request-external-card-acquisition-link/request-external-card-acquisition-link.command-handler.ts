import { CommandHandler } from '@nestjs/cqrs'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { RequestExternalCardAcquisitionLinkCommand } from './request-external-card-acquisition-link.command'
import { requestExternalCardAcquisitionLink } from './request-external-card-acquisition-link.service'

@CommandHandler(RequestExternalCardAcquisitionLinkCommand)
export class RequestExternalCardAcquisitionLinkCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly cardAcquisition: CardAcquisitionService,
    private readonly redis: RedisService,
  ) {
    super(unitOfWork)
  }

  async handle(command: RequestExternalCardAcquisitionLinkCommand) {
    return requestExternalCardAcquisitionLink(
      command,
      this.unitOfWork,
      this.cardAcquisition,
      this.redis,
    )
  }
}
