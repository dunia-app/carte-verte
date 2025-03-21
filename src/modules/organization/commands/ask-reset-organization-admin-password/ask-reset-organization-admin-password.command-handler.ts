import { CommandHandler } from '@nestjs/cqrs'
import { CacheTimes, getCacheTime } from '../../../../helpers/cache.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { ReceiverEntity } from '../../../message/domain/entities/receiver.entity'
import { OrganizationAdminRepositoryPort } from '../../database/organization-admin/organization-admin.repository.port'
import {
  OrganizationAdminEmailNotFound,
  OrganizationAdminNotActivatedError,
} from '../../errors/organization-admin.errors'
import { AskResetOrganizationAdminPasswordCommand } from './ask-reset-organization-admin-password.command'

@CommandHandler(AskResetOrganizationAdminPasswordCommand)
export class AskResetOrganizationAdminPasswordCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly redis: RedisService,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: AskResetOrganizationAdminPasswordCommand,
  ): Promise<
    Result<
      Boolean,
      OrganizationAdminNotActivatedError | OrganizationAdminEmailNotFound
    >
  > {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */

    const receiverRepo: ReceiverRepositoryPort =
      this.unitOfWork.getReceiverRepository(command.correlationId)

    let receiver: ReceiverEntity
    try {
      receiver = await receiverRepo.findOneByEmailOrThrow(command.email)
    } catch (error) {
      return Result.err(new OrganizationAdminEmailNotFound())
    }

    const organizationAdminRepo: OrganizationAdminRepositoryPort =
      this.unitOfWork.getOrganizationAdminRepository(command.correlationId)

    const found = await organizationAdminRepo.findOneByUserIdOrThrow(
      receiver.userId.value,
    )

    const res = found.askResetPassword()
    if (res.isErr) {
      return Result.err(res.error)
    }

    this.redis.persist.set(
      receiver.email.value,
      JSON.stringify({ email: command.email }),
      'EX',
      getCacheTime(CacheTimes.OneHour),
    )
    await organizationAdminRepo.save(found)

    return Result.ok(true)
  }
}
