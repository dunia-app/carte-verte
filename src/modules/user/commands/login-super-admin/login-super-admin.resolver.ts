import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import * as Sentry from "@sentry/browser"
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { AuthService } from '../../../../modules/auth/auth.service'
import { UserRoles } from '../../domain/entities/user.types'
import { WrongSuperAdminPasswordError } from '../../errors/super-admin.errors'
import { LoginSuperAdminCommand } from './login-super-admin.command'
import { LoginSuperAdminRequest } from './login-super-admin.request.dto'

@ObjectType()
class LoginSuperAdminResponse extends ErrorWithResponse(
  [WrongSuperAdminPasswordError],
  'LoginSuperAdminErrorUnion',
  String,
) {}

@Resolver()
export class LoginSuperAdminGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
  ) {}

  @AppMutation(() => LoginSuperAdminResponse, false)
  async loginSuperAdmin(
    @Args('input') input: LoginSuperAdminRequest,
  ): Promise<LoginSuperAdminResponse> {
    Sentry.setUser({
      email: input.email
    })

    const command = new LoginSuperAdminCommand({
      password: input.password,
      email: input.email,
    })

    const resLoginResp = await this.commandBus.execute(command)
    if (resLoginResp.isErr) {
      return new LoginSuperAdminResponse(Result.err(resLoginResp.error))
    }
    const loginResp = resLoginResp.unwrap()

    const jwt = this.authService.createJWT(
      loginResp.superAdminId,
      UserRoles.superAdmin,
      undefined,
      input.email
    )

    Sentry.setUser({ email: input.email });

    return new LoginSuperAdminResponse(Result.ok(jwt))
  }
}
