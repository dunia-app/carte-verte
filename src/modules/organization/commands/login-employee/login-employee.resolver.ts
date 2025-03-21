import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { LoginResponse } from '../../../../libs/ddd/interface-adapters/dtos/login.response.dto'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { AuthService } from '../../../../modules/auth/auth.service'
import { UserRoles } from '../../../../modules/user/domain/entities/user.types'
import {
  EmployeeFrozenError,
  EmployeeNewDeviceNotValidated,
  EmployeeNotActivatedError,
  EmployeeNotFoundError,
  WrongEmployeeCodeError,
} from '../../errors/employee.errors'
import { LoginEmployeeCommand } from './login-employee.command'
import { LoginEmployeeRequest } from './login-employee.request.dto'
const Sentry = require('@sentry/node')

@ObjectType()
class LoginEmployeeResponse extends ErrorWithResponse(
  [
    EmployeeNotActivatedError,
    EmployeeNewDeviceNotValidated,
    WrongEmployeeCodeError,
    EmployeeFrozenError,
    EmployeeNotFoundError,
  ],
  'LoginEmployeeErrorUnion',
  LoginResponse,
) {}

@Resolver()
export class LoginEmployeeGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @AppMutation(() => LoginEmployeeResponse, false)
  async loginEmployee(
    @Args('input') input: LoginEmployeeRequest,
  ): Promise<LoginEmployeeResponse> {
    Sentry.setUser({
      email: input.email,
    })

    const command = new LoginEmployeeCommand({
      code: input.code,
      email: input.email,
      deviceId: input.deviceId,
      chechDeviceId: true,
    })

    const resLoginResp = await this.commandBus.execute(command)
    if (resLoginResp.isErr) {
      return new LoginEmployeeResponse(Result.err(resLoginResp.error))
    }
    const loginResp = resLoginResp.unwrap()

    const jwt = this.authService.createJWT(
      loginResp.employeeId,
      UserRoles.employee,
      input.deviceId,
      input.email,
    )
    return new LoginEmployeeResponse(
      Result.ok({
        jwtToken: jwt,
        refreshToken: loginResp.refreshToken,
      }),
    )
  }
}
