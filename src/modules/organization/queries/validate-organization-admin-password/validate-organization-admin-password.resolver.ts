import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { OrganizationAdminPasswordFormatNotCorrectError } from '../../errors/organization-admin.errors'
import { ValidateOrganizationAdminPasswordQuery } from './validate-organization-admin-password.query'
import { ValidateOrganizationAdminPasswordRequest } from './validate-organization-admin-password.request.dto'

@ObjectType()
class ValidateOrganizationAdminResponse extends ErrorWithResponse(
  [OrganizationAdminPasswordFormatNotCorrectError],
  'ValidateOrganizationAdminErrorUnion',
  Boolean,
) {}

@Resolver()
export class ValidateOrganizationAdminPasswordGraphqlResolver {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly redisService: RedisService,
  ) {}

  @AppQuery(() => ValidateOrganizationAdminResponse, false)
  async validateOrganizationAdminPassword(
    @Args('input') input: ValidateOrganizationAdminPasswordRequest,
  ): Promise<ValidateOrganizationAdminResponse> {
    const cacheResult = await this.redisService.persist.get(input.token)
    if (cacheResult === null) {
      throw new Error('Token expired. Try again')
    } else {
      const tokenInfo = JSON.parse(cacheResult)
      if (tokenInfo.email !== input.email) {
        throw new Error('Email does not correspond to token')
      }
      const command = new ValidateOrganizationAdminPasswordQuery({
        password: input.password,
        email: tokenInfo.email,
      })

      const resLoginResp = await this.queryBus.execute(command)
      if (resLoginResp.isErr) {
        const result = new ValidateOrganizationAdminResponse(
          Result.err(resLoginResp.error),
        )
        return result
      }
      return new ValidateOrganizationAdminResponse(Result.ok(true))
    }
  }
}
