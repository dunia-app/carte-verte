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
  OrganizationAdminNotActivatedError,
  OrganizationAdminRefreshTokenError,
} from '../../errors/organization-admin.errors'
import { RefreshOrganizationAdminTokenCommand } from './refresh-organization-admin-token.command'

@ObjectType()
class RefreshOrganizationAdminTokenResponse extends ErrorWithResponse(
  [OrganizationAdminRefreshTokenError, OrganizationAdminNotActivatedError],
  'RefreshOrganizationAdminTokenErrorUnion',
  LoginResponse,
) {}

@Resolver()
export class RefreshOrganizationAdminTokenGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @AppMutation(() => RefreshOrganizationAdminTokenResponse, false)
  async refreshOrganizationAdminToken(
    @Args('input') input: RefreshTokenRequest,
  ): Promise<RefreshOrganizationAdminTokenResponse> {
    const jwtPayload = this.authService.verifyExpiredJWT(input.expiredJwt)
    if (jwtPayload == null || jwtPayload.role !== UserRoles.organizationAdmin) {
      throw new UnauthorizedException(
        'Invalid expired jwt token or refresh token',
      )
    }

    const command = new RefreshOrganizationAdminTokenCommand({
      organizationAdminId: jwtPayload.id,
      refreshToken: input.refreshToken,
    })

    const res = await this.commandBus.execute(command)
    if (res.isErr) {
      throw new UnauthorizedException(
        'Invalid expired jwt token or refresh token',
      )
    }
    const loginResp = res.unwrap()

    const jwt = this.authService.createJWT(
      loginResp.organizationAdminId,
      UserRoles.organizationAdmin,
      jwtPayload.deviceId,
      jwtPayload.email
    )

    return new RefreshOrganizationAdminTokenResponse(
      Result.ok({
        jwtToken: jwt,
        refreshToken: loginResp.refreshToken,
      }),
    )
  }
}
