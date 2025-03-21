import { Result } from '@badrap/result'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { TokenExpiredError } from '../../../../infrastructure/redis/redis.errors'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { ValidateOrganizationAdminMailTokenRequest } from './validate-organization-admin-mail-token.request.dto'

@ObjectType()
class ValidateOrganizationAdminMailTokenResponse extends ErrorWithResponse(
  [TokenExpiredError],
  'ValidateOrganizationAdminMailTokenErrorUnion',
  Boolean,
) {}

@Resolver()
export class ValidateOrganizationAdminMailTokenGraphqlResolver {
  constructor(private readonly redisService: RedisService) {}

  @AppQuery(() => ValidateOrganizationAdminMailTokenResponse, false)
  async validateOrganizationAdminMailToken(
    @Args('input') input: ValidateOrganizationAdminMailTokenRequest,
  ): Promise<ValidateOrganizationAdminMailTokenResponse> {
    let cacheResult = await this.redisService.persist.get(input.token)
    if (!cacheResult) {
      return new ValidateOrganizationAdminMailTokenResponse(
        Result.err(new TokenExpiredError()),
      )
    }
    const authInfo = JSON.parse(cacheResult)
    if (input.email !== authInfo.email) {
      return new ValidateOrganizationAdminMailTokenResponse(
        Result.err(new TokenExpiredError()),
      )
    }

    return new ValidateOrganizationAdminMailTokenResponse(Result.ok(true))
  }
}
