import { UnauthorizedException } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { LoginResponse } from '../../../../libs/ddd/interface-adapters/dtos/login.response.dto'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { AuthService } from '../../../auth/auth.service'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { RefreshTokenRequest } from '../../dtos/employee.response.dto'
import {
  EmployeeFrozenError,
  EmployeeNotActivatedError,
  EmployeeRefreshTokenError,
} from '../../errors/employee.errors'
import { RefreshEmployeeTokenCommand } from './refresh-employee-token.command'

@ObjectType()
class RefreshEmployeeTokenResponse extends ErrorWithResponse(
  [EmployeeRefreshTokenError, EmployeeNotActivatedError, EmployeeFrozenError],
  'RefreshEmployeeTokenErrorUnion',
  LoginResponse,
) {}

@Resolver()
export class RefreshEmployeeTokenGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @AppMutation(() => RefreshEmployeeTokenResponse, false)
  async refreshEmployeeToken(
    @Args('input') input: RefreshTokenRequest,
  ): Promise<RefreshEmployeeTokenResponse> {
    const jwtPayload = this.authService.verifyExpiredJWT(input.expiredJwt)
    if (jwtPayload == null || jwtPayload.role !== UserRoles.employee) {
      throw new UnauthorizedException(
        'Invalid expired jwt token or refresh token',
      )
    }

    const command = new RefreshEmployeeTokenCommand({
      employeeId: jwtPayload.id,
      refreshToken: input.refreshToken,
      deviceId: jwtPayload.deviceId,
    })

    const res = await this.commandBus.execute(command)
    if (res.isErr) {
      throw new UnauthorizedException(
        'Invalid expired jwt token or refresh token',
      )
    }
    const loginResp = res.unwrap()

    const jwt = this.authService.createJWT(
      loginResp.employeeId,
      UserRoles.employee,
      jwtPayload.deviceId,
      jwtPayload.email
    )

    return new RefreshEmployeeTokenResponse(
      Result.ok({
        jwtToken: jwt,
        refreshToken: loginResp.refreshToken,
      }),
    )
  }
}
