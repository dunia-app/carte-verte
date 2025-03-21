import { CommandHandler } from '@nestjs/cqrs'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { LoginEmployeeCommand } from '../login-employee/login-employee.command'
import { loginEmployee } from '../login-employee/login-employee.service'
import { PushEmployeeDeviceIdCommand } from '../push-employee-device-id/push-employee-device-id.command'
import { pushEmployeeDeviceId } from '../push-employee-device-id/push-employee-device-id.service'
import { LoginEmployeeNewDeviceIdCommand } from './login-employee-new-device-id.command'

@CommandHandler(LoginEmployeeNewDeviceIdCommand)
export class LoginEmployeeNewDeviceIdCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    super(unitOfWork)
  }

  async handle(command: LoginEmployeeNewDeviceIdCommand) {
    const res = await loginEmployee(
      new LoginEmployeeCommand({
        correlationId: command.correlationId,
        email: command.email,
        code: command.code,
        deviceId: command.deviceId,
        chechDeviceId: false,
      }),
      this.unitOfWork,
      this.redis,
      this.config,
    )
    if (res.isErr) {
      return res
    }
    await pushEmployeeDeviceId(
      new PushEmployeeDeviceIdCommand({
        correlationId: command.correlationId,
        employeeId: command.employeeId,
        deviceId: command.deviceId,
      }),
      this.unitOfWork,
    )
    return res
  }
}
