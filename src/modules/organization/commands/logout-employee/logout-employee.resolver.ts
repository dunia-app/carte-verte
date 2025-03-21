import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import {
  CurrentDeviceId,
  CurrentUser,
} from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../../modules/user/domain/entities/user.types'
import { EmployeeEntity } from '../../domain/entities/employee.entity'
import {
  EmployeeFrozenError,
  EmployeeNotActivatedError,
  EmployeeNotFoundError,
} from '../../errors/employee.errors'
import { LogoutEmployeeCommand } from './logout-employee.command'
import { LogoutEmployeeRequest } from './logout-employee.request.dto'

@ObjectType()
class LogoutEmployeeResponse extends ErrorWithResponse(
  [EmployeeNotActivatedError, EmployeeFrozenError, EmployeeNotFoundError],
  'LogoutEmployeeErrorUnion',
  Boolean,
) {}

@Resolver()
export class LogoutEmployeeGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => LogoutEmployeeResponse, UserRoles.employee)
  async logoutEmployee(
    @Args('input') input: LogoutEmployeeRequest,
    @CurrentUser() employee: EmployeeEntity,
    @CurrentDeviceId() deviceId: string,
  ): Promise<LogoutEmployeeResponse> {
    const command = new LogoutEmployeeCommand({
      employeeId: employee.id.value,
      refreshToken: input.refreshToken,
      deviceId: deviceId,
    })

    const resLogoutResp = await this.commandBus.execute(command)
    if (resLogoutResp.isErr) {
      return new LogoutEmployeeResponse(Result.err(resLogoutResp.error))
    }
    return new LogoutEmployeeResponse(Result.ok(true))
  }
}
