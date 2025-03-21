import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Throttle } from '@nestjs/throttler'
import { ErrorWithResponse } from '../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppQuery } from '../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../modules/user/domain/entities/user.types'
import { PlaceNotFoundError } from './find-place.errors'
import { ApiAdresseResponse } from './find-place.response.dto'
import { FindPlaceService } from './find-place.service'

@ObjectType()
class FindPlaceResponse extends ErrorWithResponse(
  [PlaceNotFoundError],
  'FindPlaceErrorUnion',
  [ApiAdresseResponse],
) {}

@Resolver()
export class FindPlaceResolver {
  constructor(private readonly service: FindPlaceService) {}

  @Throttle({
    default: { limit: 5, ttl: 10000 },
  })
  @AppQuery(() => FindPlaceResponse, UserRoles.employee)
  async findPlace(@Args('input') input: string): Promise<FindPlaceResponse> {
    const res = await this.service.findPlaceCoords(input)
    return new FindPlaceResponse(res)
  }

  @Throttle({
    default: { limit: 5, ttl: 10000 },
  })
  @AppQuery(() => FindPlaceResponse, UserRoles.employee)
  async findCoordsAddress(
    @Args('latitude') latitude: number,
    @Args('longitude') longitude: number,
  ): Promise<FindPlaceResponse> {
    const res = await this.service.findCoordsAddress(latitude, longitude)
    return new FindPlaceResponse(res)
  }
}