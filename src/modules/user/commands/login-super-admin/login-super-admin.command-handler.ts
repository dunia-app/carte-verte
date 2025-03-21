import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { SuperAdminRepositoryPort } from '../../database/super-admin/super-admin.repository.port'
import { SuperAdminLoginResp } from '../../dtos/super-admin.response.dto'
import { WrongSuperAdminPasswordError } from '../../errors/super-admin.errors'
import { LoginSuperAdminCommand } from './login-super-admin.command'

@CommandHandler(LoginSuperAdminCommand)
export class LoginSuperAdminCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: LoginSuperAdminCommand,
  ): Promise<Result<SuperAdminLoginResp, WrongSuperAdminPasswordError>> {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const receiverRepo: ReceiverRepositoryPort =
      this.unitOfWork.getReceiverRepository(command.correlationId)

    const receiver = await receiverRepo.findOneByEmailOrThrow(command.email)

    const superAdminRepo: SuperAdminRepositoryPort =
      this.unitOfWork.getSuperAdminRepository(command.correlationId)

    const superAdmin = await superAdminRepo.findOneByUserIdOrThrow(
      receiver.userId.value,
    )

    const refreshToken = await superAdmin.login(command.password)
    if (refreshToken.isErr) {
      return Result.err(refreshToken.error)
    }
    return Result.ok({
      superAdminId: superAdmin.id,
    })
  }
}
