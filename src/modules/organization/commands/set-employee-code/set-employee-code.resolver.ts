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
  EmployeeCodeFormatNotCorrectError,
  EmployeeFrozenError,
  EmployeeNewDeviceNotValidated,
  EmployeeNotActivatedError,
} from '../../errors/employee.errors'
import { SetEmployeeCodeCommand } from './set-employee-code.command'
import { SetEmployeeCodeRequest } from './set-employee-code.request.dto'

@ObjectType()
class SetEmployeeCodeResponse extends ErrorWithResponse(
  [
    TokenExpiredError,
    EmployeeNewDeviceNotValidated,
    EmployeeCodeFormatNotCorrectError,
    EmployeeNotActivatedError,
    EmployeeFrozenError,
  ],
  'SetEmployeeCodeErrorUnion',
  LoginResponse,
) {}

@Resolver()
export class SetEmployeeCodeGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
  ) {}

  @AppMutation(() => SetEmployeeCodeResponse, false, {
    description:
      'Set a code to reset it. Only available to already actived employee',
  })
  async setEmployeeCode(
    @Args('input') input: SetEmployeeCodeRequest,
  ): Promise<SetEmployeeCodeResponse> {
    const cacheResult = await this.redisService.persist.get(input.token)
    if (cacheResult === null) {
      return new SetEmployeeCodeResponse(Result.err(new TokenExpiredError()))
    }
    const tokenInfo = JSON.parse(cacheResult)

    if (tokenInfo.email !== input.email) {
      return new SetEmployeeCodeResponse(Result.err(new TokenExpiredError()))
    }
    const command = new SetEmployeeCodeCommand({
      code: input.code,
      email: tokenInfo.email,
      deviceId: input.deviceId,
    })

    const resLoginResp = await this.commandBus.execute(command)
    if (resLoginResp.isErr) {
      return new SetEmployeeCodeResponse(Result.err(resLoginResp.error))
    }
    const loginResp = resLoginResp.unwrap()

    const jwt = this.authService.createJWT(
      loginResp.employeeId,
      UserRoles.employee,
      undefined,
      input.email
    )
    // do not forget to remove the redis key when result is ok
    this.redisService.persist.del(input.token)
    this.redisService.persist.del(input.email)
    return new SetEmployeeCodeResponse(
      Result.ok({
        jwtToken: jwt,
        refreshToken: loginResp.refreshToken,
      }),
    )
    // }
  }
}
