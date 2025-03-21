import { CommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { EmployeeLoginResp } from '../../dtos/employee.response.dto'
import {
  EmployeeCodeTooManyFailedAttemptError,
  EmployeeFrozenError,
  EmployeeNotActivatedError,
  EmployeeNotFoundError,
  WrongEmployeeCodeError,
} from '../../errors/employee.errors'
import { LoginEmployeeCommand } from './login-employee.command'
import { loginEmployee } from './login-employee.service'

@CommandHandler(LoginEmployeeCommand)
export class LoginEmployeeCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(
    command: LoginEmployeeCommand,
  ): Promise<
    Result<
      EmployeeLoginResp,
      | EmployeeNotActivatedError
      | WrongEmployeeCodeError
      | EmployeeCodeTooManyFailedAttemptError
      | EmployeeFrozenError
      | EmployeeNotFoundError
    >
  > {
    return loginEmployee(command, this.unitOfWork, this.redis, this.config)
  }
}
