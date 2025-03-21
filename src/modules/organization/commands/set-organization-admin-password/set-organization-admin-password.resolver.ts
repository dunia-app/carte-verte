import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { LoginResponse } from '../../../../libs/ddd/interface-adapters/dtos/login.response.dto'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { AuthService } from '../../../auth/auth.service'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationAdminPasswordFormatNotCorrectError } from '../../errors/organization-admin.errors'
import { SetOrganizationAdminPasswordCommand } from './set-organization-admin-password.command'
import { SetOrganizationAdminPasswordRequest } from './set-organization-admin-password.request.dto'

@ObjectType()
class SetOrganizationAdminPasswordResponse extends ErrorWithResponse(
  [OrganizationAdminPasswordFormatNotCorrectError],
  'SetOrganizationAdminPasswordErrorUnion',
  LoginResponse,
) {}

@Resolver()
export class SetOrganizationAdminPasswordGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
  ) {}

  @AppMutation(() => SetOrganizationAdminPasswordResponse, false, {
    description:
      'Set a password to login. Last step to organizationAdmin activation process',
  })
  async setOrganizationAdminPassword(
    @Args('input') input: SetOrganizationAdminPasswordRequest,
  ): Promise<SetOrganizationAdminPasswordResponse> {
    const cacheResult = await this.redisService.persist.get(input.token)
    if (cacheResult === null) {
      throw new Error('Token expired. Try again')
    } else {
      const tokenInfo = JSON.parse(cacheResult)
      if (tokenInfo.email !== input.email) {
        throw new Error('Email does not correspond to token')
      }
      const command = new SetOrganizationAdminPasswordCommand({
        password: input.password,
        email: tokenInfo.email,
      })

      const resLoginResp = await this.commandBus.execute(command)
      if (resLoginResp.isErr) {
        const result = new SetOrganizationAdminPasswordResponse(
          Result.err(resLoginResp.error),
        )
        return result
      }
      const loginResp = resLoginResp.unwrap()

      const jwt = this.authService.createJWT(
        loginResp.organizationAdminId,
        UserRoles.organizationAdmin,
        undefined,
        input.email
      )
      // do not forget to remove the redis key when result is ok
      this.redisService.persist.del(input.token)
      return new SetOrganizationAdminPasswordResponse(
        Result.ok({
          jwtToken: jwt,
          refreshToken: loginResp.refreshToken,
        }),
      )
    }
  }
}
