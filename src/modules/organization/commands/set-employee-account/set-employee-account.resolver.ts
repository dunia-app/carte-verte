import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { TokenExpiredError } from '../../../../infrastructure/redis/redis.errors'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { LoginResponse } from '../../../../libs/ddd/interface-adapters/dtos/login.response.dto'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { AuthService } from '../../../auth/auth.service'
import { UserRoles } from '../../../user/domain/entities/user.types'
import {
  EmployeeAlreadyActivatedError,
  EmployeeAlreadyExistsError,
  EmployeeCodeFormatNotCorrectError,
  EmployeeFrozenError,
  EmployeeNewDeviceNotValidated,
  MobileTokenNotSetError,
} from '../../errors/employee.errors'
import { SetEmployeeAccountCommand } from './set-employee-account.command'
import { SetEmployeeAccountRequest } from './set-employee-account.request.dto'

@ObjectType()
class SetEmployeeAccountResponse extends ErrorWithResponse(
  [
    TokenExpiredError,
    MobileTokenNotSetError,
    EmployeeNewDeviceNotValidated,
    EmployeeCodeFormatNotCorrectError,
    EmployeeAlreadyActivatedError,
    EmployeeAlreadyExistsError,
    EmployeeFrozenError,
  ],
  'SetEmployeeAccountErrorUnion',
  LoginResponse,
) {}

@Resolver()
export class SetEmployeeAccountGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
  ) {}

  @AppMutation(() => SetEmployeeAccountResponse, false, {
    description:
      'Set a code to login. Last step to employee activation process',
  })
  async setEmployeeAccount(
    @Args('input') input: SetEmployeeAccountRequest,
  ): Promise<SetEmployeeAccountResponse> {
    const [cacheResult, mobileCacheResult] = await Promise.all([
      this.redisService.persist.get(input.token),
      this.redisService.persist.get(`smsTokenValidated:${input.email}`),
    ])
    if (cacheResult === null) {
      return new SetEmployeeAccountResponse(Result.err(new TokenExpiredError()))
    }
    if (mobileCacheResult === null) {
      return new SetEmployeeAccountResponse(
        Result.err(new MobileTokenNotSetError()),
      )
    }
    const tokenInfo = JSON.parse(cacheResult)
    const mobileTokenInfo = JSON.parse(mobileCacheResult)

    if (tokenInfo.email !== input.email) {
      return new SetEmployeeAccountResponse(Result.err(new TokenExpiredError()))
    }
    if (mobileTokenInfo.deviceId !== input.deviceId) {
      return new SetEmployeeAccountResponse(
        Result.err(new EmployeeNewDeviceNotValidated()),
      )
    }

    const command = new SetEmployeeAccountCommand({
      email: input.email,
      code: input.code,
      mobile: mobileTokenInfo.mobile,
      deviceId: input.deviceId,
    })

    const resLoginResp = await this.commandBus.execute(command)
    if (resLoginResp.isErr) {
      return new SetEmployeeAccountResponse(Result.err(resLoginResp.error))
    }
    const loginResp = resLoginResp.unwrap()

    const jwt = this.authService.createJWT(
      loginResp.employeeId,
      UserRoles.employee,
      input.deviceId,
      input.email
    )
    // do not forget to remove the redis key when result is ok
    this.redisService.persist.del(input.token)
    this.redisService.persist.del(`smsTokenValidated:${input.email}`)
    return new SetEmployeeAccountResponse(
      Result.ok({
        jwtToken: jwt,
        refreshToken: loginResp.refreshToken,
      }),
    )
  }
}
