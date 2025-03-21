import { Result } from '@badrap/result'
import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { TokenExpiredError } from '../../../../infrastructure/redis/redis.errors'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { LoginResponse } from '../../../../libs/ddd/interface-adapters/dtos/login.response.dto'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { AuthService } from '../../../auth/auth.service'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { WrongSmsCodeError } from '../../errors/employee.errors'
import { LoginEmployeeNewDeviceIdCommand } from './login-employee-new-device-id.command'
import { LoginEmployeeNewDeviceIdRequest } from './login-employee-new-device-id.request.dto'
const Sentry = require('@sentry/node')


@ObjectType()
class LoginEmployeeNewDeviceIdResponse extends ErrorWithResponse(
  [TokenExpiredError, WrongSmsCodeError],
  'LoginEmployeeNewDeviceIdErrorUnion',
  LoginResponse,
) {}

@Resolver()
export class LoginEmployeeNewDeviceIdGraphqlResolver {
  constructor(
    private readonly redisService: RedisService,
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @AppMutation(() => LoginEmployeeNewDeviceIdResponse, false)
  async loginEmployeeNewDeviceId(
    @Args('input') input: LoginEmployeeNewDeviceIdRequest,
  ): Promise<LoginEmployeeNewDeviceIdResponse> {
    Sentry.setUser({
      email: input.email
    })

    let cacheResult = await this.redisService.persist.get(input.token)
    if (!cacheResult) {
      return new LoginEmployeeNewDeviceIdResponse(
        Result.err(new TokenExpiredError()),
      )
    }
    const authInfo = JSON.parse(cacheResult)
    if (input.validationCode !== authInfo.code) {
      return new LoginEmployeeNewDeviceIdResponse(
        Result.err(new WrongSmsCodeError()),
      )
    }
    const pushDeviceIdsCommand = new LoginEmployeeNewDeviceIdCommand({
      employeeId: authInfo.employeeId,
      deviceId: authInfo.deviceId,
      code: input.code,
      email: input.email,
    })
    const resLoginResp = await this.commandBus.execute(pushDeviceIdsCommand)
    if (resLoginResp.isErr) {
      return new LoginEmployeeNewDeviceIdResponse(
        Result.err(resLoginResp.error),
      )
    }
    const loginResp = resLoginResp.unwrap()

    const jwt = this.authService.createJWT(
      loginResp.employeeId,
      UserRoles.employee,
      authInfo.deviceId,
      input.email
    )
    this.redisService.persist.del(input.token)
    return new LoginEmployeeNewDeviceIdResponse(
      Result.ok({
        jwtToken: jwt,
        refreshToken: loginResp.refreshToken,
      }),
    )
  }
}
