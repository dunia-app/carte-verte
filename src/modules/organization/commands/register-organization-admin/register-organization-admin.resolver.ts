import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { LoginResponse } from '../../../../libs/ddd/interface-adapters/dtos/login.response.dto'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { AuthService } from '../../../auth/auth.service'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationIdIsMissingError } from '../../errors/organization-admin.errors'
import { RegisterOrganizationAdminCommand } from './register-organization-admin.command'
import { RegisterOrganizationAdminRequest } from './register-organization-admin.request.dto'

@ObjectType()
class RegisterOrganizationAdminResponse extends ErrorWithResponse(
  [],
  'RegisterOrganizationAdminErrorUnion',
  LoginResponse,
) {}

@Resolver()
export class RegisterOrganizationAdminGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly redisService: RedisService,
    private readonly authService: AuthService,
  ) {}

  @AppMutation(() => RegisterOrganizationAdminResponse, false)
  async registerOrganizationAdmin(
    @Args('input') input: RegisterOrganizationAdminRequest,
    @CurrentOrganizationId() organizationId: string,
  ): Promise<RegisterOrganizationAdminResponse> {
    if (!organizationId) {
      return new RegisterOrganizationAdminResponse(
        Result.err(new OrganizationIdIsMissingError()),
      )
    }
    const cacheResult = await this.redisService.persist.get(input.token)
    if (cacheResult === null) {
      throw new Error('Token expired. Try again')
    } else {
      const tokenInfo = JSON.parse(cacheResult)
      if (tokenInfo.email !== input.email) {
        throw new Error('Email does not correspond to token')
      }
      const command = new RegisterOrganizationAdminCommand({
        password: input.password,
        email: tokenInfo.email,
        siret: input.siret,
        name: input.name,
        address: input.address,
        organizationId: organizationId,
      })

      const resLoginResp = await this.commandBus.execute(command)
      if (resLoginResp.isErr) {
        const result = new RegisterOrganizationAdminResponse(
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
      return new RegisterOrganizationAdminResponse(
        Result.ok({
          jwtToken: jwt,
          refreshToken: loginResp.refreshToken,
        }),
      )
    }
  }
}
