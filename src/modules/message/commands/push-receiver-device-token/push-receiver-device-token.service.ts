import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { ReceiverRepositoryPort } from '../../database/receiver/receiver.repository.port'
import { PushReceiverDeviceTokenCommand } from './push-receiver-device-token.command'

export async function pushReceiverDeviceToken(
  command: PushReceiverDeviceTokenCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<string, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const receiverRepo: ReceiverRepositoryPort = unitOfWork.getReceiverRepository(
    command.correlationId,
  )

  const found = await receiverRepo.findOneByUserIdOrThrow(command.userId)
  const res = found.pushDeviceTokens(command.deviceToken, command.deviceId)

  if (res.isOk) {
    await receiverRepo.save(found)
  }
  return Result.ok(command.deviceToken)
}
