import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { ReceiverRepositoryPort } from '../../database/receiver/receiver.repository.port'
import { AcceptNotificationCommand } from './accept-notification.command'

@CommandHandler(AcceptNotificationCommand)
export class AcceptNotificationCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: AcceptNotificationCommand,
  ): Promise<Result<Boolean, ExceptionBase>> {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const receiverRepo: ReceiverRepositoryPort =
      this.unitOfWork.getReceiverRepository(command.correlationId)

    const receiver = await receiverRepo.findOneByUserIdOrThrow(command.userId)

    receiver.acceptNotification = command.acceptNotification

    const updated = await receiverRepo.save(receiver)
    return Result.ok(updated.acceptNotification)
  }
}
