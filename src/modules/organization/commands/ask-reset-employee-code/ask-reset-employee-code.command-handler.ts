import { CommandHandler } from '@nestjs/cqrs'
import { CacheTimes, getCacheTime } from '../../../../helpers/cache.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { EmployeeRepositoryPort } from '../../database/employee/employee.repository.port'
import {
  EmployeeFrozenError,
  EmployeeNotActivatedError,
} from '../../errors/employee.errors'
import { AskResetEmployeeCodeCommand } from './ask-reset-employee-code.command'

@CommandHandler(AskResetEmployeeCodeCommand)
export class AskResetEmployeeCodeCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly redis: RedisService,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: AskResetEmployeeCodeCommand,
  ): Promise<Result<Boolean, EmployeeNotActivatedError | EmployeeFrozenError>> {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */

    const receiverRepo: ReceiverRepositoryPort =
      this.unitOfWork.getReceiverRepository(command.correlationId)

    const receiver = await receiverRepo.findOneByEmailOrThrow(command.email)

    const employeeRepo: EmployeeRepositoryPort =
      this.unitOfWork.getEmployeeRepository(command.correlationId)

    const found = await employeeRepo.findOneByUserIdOrThrow(
      receiver.userId.value,
    )

    const res = found.askResetCode()
    if (res.isErr) {
      return Result.err(res.error)
    }

    this.redis.persist.set(
      receiver.email.value,
      JSON.stringify({ email: command.email }),
      'EX',
      getCacheTime(CacheTimes.OneHour),
    )
    await employeeRepo.save(found)

    return Result.ok(true)
  }
}
