import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { SuperAdminRepositoryPort } from '../../database/super-admin/super-admin.repository.port'
import { SuperAdminEntity } from '../../domain/entities/super-admin.entity'
import { CreateSuperAdminCommand } from './create-super-admin.command'

@CommandHandler(CreateSuperAdminCommand)
export class CreateSuperAdminCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: CreateSuperAdminCommand,
  ): Promise<Result<UUID, ExceptionBase>> {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const superAdminRepo: SuperAdminRepositoryPort =
      this.unitOfWork.getSuperAdminRepository(command.correlationId)

    const superAdmin = SuperAdminEntity.create({
      userId: new UUID(command.userId),
      password: command.password,
    })

    const created = await superAdminRepo.save(superAdmin)
    return Result.ok(created.id)
  }
}
