import { Result } from '@badrap/result'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { TokenExpiredError } from '../../../../infrastructure/redis/redis.errors'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { ValidateEmployeeMailTokenRequest } from './validate-employee-mail-token.request.dto'

@ObjectType()
class ValidateEmployeeMailTokenResponse extends ErrorWithResponse(
  [TokenExpiredError],
  'ValidateEmployeeMailTokenErrorUnion',
  Boolean,
) {}

@Resolver()
export class ValidateEmployeeMailTokenGraphqlResolver {
  constructor(private readonly redisService: RedisService) {}

  @AppQuery(() => ValidateEmployeeMailTokenResponse, false)
  async validateEmployeeMailToken(
    @Args('input') input: ValidateEmployeeMailTokenRequest,
  ): Promise<ValidateEmployeeMailTokenResponse> {
    let cacheResult = await this.redisService.persist.get(input.token)
    if (!cacheResult) {
      return new ValidateEmployeeMailTokenResponse(
        Result.err(new TokenExpiredError()),
      )
    }
    const authInfo = JSON.parse(cacheResult)
    if (input.email !== authInfo.email) {
      return new ValidateEmployeeMailTokenResponse(
        Result.err(new TokenExpiredError()),
      )
    }

    return new ValidateEmployeeMailTokenResponse(Result.ok(true))
  }
}
