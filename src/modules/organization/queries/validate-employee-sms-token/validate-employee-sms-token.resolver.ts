import { Result } from '@badrap/result'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { CacheTimes, getCacheTime } from '../../../../helpers/cache.helper'
import { TokenExpiredError } from '../../../../infrastructure/redis/redis.errors'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { WrongSmsCodeError } from '../../errors/employee.errors'
import { ValidateEmployeeSmsTokenRequest } from './validate-employee-sms-token.request.dto'

@ObjectType()
class ValidateEmployeeSmsTokenResponse extends ErrorWithResponse(
  [TokenExpiredError, WrongSmsCodeError],
  'ValidateEmployeeSmsTokenErrorUnion',
  String,
) {}

@Resolver()
export class ValidateEmployeeSmsTokenGraphqlResolver {
  constructor(private readonly redisService: RedisService) {}

  @AppQuery(() => ValidateEmployeeSmsTokenResponse, false)
  async validateEmployeeSmsToken(
    @Args('input') input: ValidateEmployeeSmsTokenRequest,
  ): Promise<ValidateEmployeeSmsTokenResponse> {
    let cacheResult = await this.redisService.persist.get(input.mobileToken)
    if (!cacheResult) {
      return new ValidateEmployeeSmsTokenResponse(
        Result.err(new TokenExpiredError()),
      )
    }
    const authInfo = JSON.parse(cacheResult)
    if (input.mobileCode !== authInfo.code) {
      return new ValidateEmployeeSmsTokenResponse(
        Result.err(new WrongSmsCodeError()),
      )
    }
    this.redisService.persist.del(input.mobileToken)

    await this.redisService.persist.set(
      `smsTokenValidated:${authInfo.email}`,
      JSON.stringify({
        mobile: authInfo.mobile,
        deviceId: authInfo.deviceId,
      }),
      'EX',
      getCacheTime(CacheTimes.FifteenMinutes),
    )

    return new ValidateEmployeeSmsTokenResponse(Result.ok(authInfo.email))
  }
}
