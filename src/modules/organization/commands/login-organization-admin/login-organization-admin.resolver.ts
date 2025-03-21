import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { LoginResponse } from '../../../../libs/ddd/interface-adapters/dtos/login.response.dto'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { AuthService } from '../../../../modules/auth/auth.service'
import { UserRoles } from '../../../../modules/user/domain/entities/user.types'
import {
  OrganizationAdminNotActivatedError,
  OrganizationAdminNotFoundError,
  WrongOrganizationAdminPasswordError,
} from '../../errors/organization-admin.errors'
import { LoginOrganizationAdminCommand } from './login-organization-admin.command'
import { LoginOrganizationAdminRequest } from './login-organization-admin.request.dto'
const Sentry = require('@sentry/node')


@ObjectType()
class LoginOrganizationAdminResponse extends ErrorWithResponse(
  [
    OrganizationAdminNotActivatedError,
    WrongOrganizationAdminPasswordError,
    OrganizationAdminNotFoundError,
  ],
  'LoginOrganizationAdminErrorUnion',
  LoginResponse,
) {}

@Resolver()
export class LoginOrganizationAdminGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @AppMutation(() => LoginOrganizationAdminResponse, false)
  async loginOrganizationAdmin(
    @Args('input') input: LoginOrganizationAdminRequest,
  ): Promise<LoginOrganizationAdminResponse> {
    Sentry.setUser({
      email: input.email
    })

    const command = new LoginOrganizationAdminCommand({
      password: input.password,
      email: input.email,
    })

    const resLoginResp = await this.commandBus.execute(command)
    if (resLoginResp.isErr) {
      return new LoginOrganizationAdminResponse(Result.err(resLoginResp.error))
    }
    const loginResp = resLoginResp.unwrap()

    const jwt = this.authService.createJWT(
      loginResp.organizationAdminId,
      UserRoles.organizationAdmin,
      undefined,
      input.email
    )
    
    return new LoginOrganizationAdminResponse(
      Result.ok({
        jwtToken: jwt,
        refreshToken: loginResp.refreshToken,
      }),
    )
  }
}
