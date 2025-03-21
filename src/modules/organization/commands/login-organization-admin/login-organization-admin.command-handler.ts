import { CommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { OrganizationAdminRepositoryPort } from '../../database/organization-admin/organization-admin.repository.port'
import { OrganizationAdminLoginResp } from '../../dtos/organization-admin.response.dto'
import {
  OrganizationAdminNotActivatedError,
  OrganizationAdminNotFoundError,
  OrganizationAdminPasswordTooManyFailedAttemptError,
  WrongOrganizationAdminPasswordError,
} from '../../errors/organization-admin.errors'
import { LoginOrganizationAdminCommand } from './login-organization-admin.command'

@CommandHandler(LoginOrganizationAdminCommand)
export class LoginOrganizationAdminCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly config: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: LoginOrganizationAdminCommand,
  ): Promise<
    Result<
      OrganizationAdminLoginResp,
      | OrganizationAdminNotActivatedError
      | WrongOrganizationAdminPasswordError
      | OrganizationAdminNotFoundError
      | OrganizationAdminPasswordTooManyFailedAttemptError
    >
  > {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    try {
      const receiverRepo: ReceiverRepositoryPort =
        this.unitOfWork.getReceiverRepository(command.correlationId)

      const receiver = await receiverRepo.findOneByEmailOrThrow(command.email)

      const organizationAdminRepo: OrganizationAdminRepositoryPort =
        this.unitOfWork.getOrganizationAdminRepository(command.correlationId)

      const organizationAdmin =
        await organizationAdminRepo.findOneByUserIdOrThrow(
          receiver.userId.value,
        )

      const refreshToken = await organizationAdmin.login(
        command.password,
        this.config.getSaltRound(),
      )
      if (refreshToken.isErr) {
        if (
          refreshToken.error instanceof
          OrganizationAdminPasswordTooManyFailedAttemptError
        ) {
          await organizationAdminRepo.save(organizationAdmin)
        }
        if (refreshToken.error instanceof WrongOrganizationAdminPasswordError) {
          await organizationAdminRepo.save(organizationAdmin)
        }
        return Result.err(refreshToken.error)
      }

      await organizationAdminRepo.save(organizationAdmin)
      return Result.ok({
        organizationAdminId: organizationAdmin.id,
        refreshToken: refreshToken.unwrap(),
      })
    } catch (e) {
      if (e instanceof NotFoundException) {
        return Result.err(new OrganizationAdminNotFoundError(e))
      } else {
        throw e
      }
    }
  }
}
