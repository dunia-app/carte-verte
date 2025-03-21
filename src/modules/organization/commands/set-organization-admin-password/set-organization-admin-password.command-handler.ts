import { CommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { OrganizationAdminRepositoryPort } from '../../database/organization-admin/organization-admin.repository.port'
import { OrganizationAdminLoginResp } from '../../dtos/organization-admin.response.dto'
import { OrganizationAdminPasswordFormatNotCorrectError } from '../../errors/organization-admin.errors'
import { SetOrganizationAdminPasswordCommand } from './set-organization-admin-password.command'

@CommandHandler(SetOrganizationAdminPasswordCommand)
export class SetOrganizationAdminPasswordCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly configService: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: SetOrganizationAdminPasswordCommand,
  ): Promise<
    Result<
      OrganizationAdminLoginResp,
      OrganizationAdminPasswordFormatNotCorrectError
    >
  > {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */

    const receiverRepo: ReceiverRepositoryPort =
      this.unitOfWork.getReceiverRepository(command.correlationId)

    const receiver = await receiverRepo.findOneByEmailOrThrow(command.email)

    const organizationAdminRepo: OrganizationAdminRepositoryPort =
      this.unitOfWork.getOrganizationAdminRepository(command.correlationId)

    const found = await organizationAdminRepo.findOneByUserIdOrThrow(
      receiver.userId.value,
    )

    const refreshToken = await found.setPassword(
      command.password,
      this.configService.getSaltRound(),
    )
    if (refreshToken.isErr) {
      return Result.err(refreshToken.error)
    }

    await organizationAdminRepo.save(found)
    return Result.ok({
      organizationAdminId: found.id,
      refreshToken: refreshToken.unwrap(),
    })
  }
}
