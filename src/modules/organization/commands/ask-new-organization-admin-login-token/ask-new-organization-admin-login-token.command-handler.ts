import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { OrganizationAdminRepositoryPort } from '../../database/organization-admin/organization-admin.repository.port'
import { OrganizationAdminAlreadyActivatedError } from '../../errors/organization-admin.errors'
import { AskNewOrganizationAdminLoginTokenCommand } from './ask-new-organization-admin-login-token.command'

@CommandHandler(AskNewOrganizationAdminLoginTokenCommand)
export class AskNewOrganizationAdminLoginTokenCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: AskNewOrganizationAdminLoginTokenCommand,
  ): Promise<Result<Boolean, OrganizationAdminAlreadyActivatedError>> {
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

    const res = found.askNewLoginToken()
    if (res.isErr) {
      return Result.err(res.error)
    }
    await organizationAdminRepo.save(found)

    return Result.ok(true)
  }
}
