import { QueryHandler } from '@nestjs/cqrs'
import { CacheTimes } from '../../../../helpers/cache.helper'
import { PlaceNotFoundError } from '../../../../infrastructure/place-autocomplete/find-place/find-place.errors'
import { FindPlaceService } from '../../../../infrastructure/place-autocomplete/find-place/find-place.service'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Coords } from '../../../../libs/ddd/domain/value-objects/coordinates.value-object'
import { OrganizationRepository } from '../../../organization/database/organization/organization.repository'
import { MerchantRepository } from '../../database/merchant/merchant.repository'
import { PointOfSalesResponse } from '../../dtos/merchant.response.dto'
import { FindPointOfSalesQuery } from './find-point-of-sales.query'

@QueryHandler(FindPointOfSalesQuery)
export class FindPointOfSalesQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly merchantRepo: MerchantRepository,
    private readonly organizationRepo: OrganizationRepository,
    private readonly findPlaceService: FindPlaceService,
    private readonly redis: RedisService,
  ) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves merchants directly from a repository.
   */
  async handle(
    query: FindPointOfSalesQuery,
  ): Promise<Result<PointOfSalesResponse, PlaceNotFoundError>> {
    const organization = await this.organizationRepo.findOneByIdOrThrow(
      query.organizationId,
    )

    let latitude: number, longitude: number
    if (!query.latitude || !query.longitude) {
      const place = query.address
        ? await this.findPlaceService.findPlaceCoords(query.address)
        : undefined
      const coords = query.address ? place?.unwrap()[0] : organization?.address!
      if (!coords) {
        return Result.err(new PlaceNotFoundError())
      }
      latitude = coords.latitude!
      longitude = coords.longitude!
    } else {
      latitude = query.latitude
      longitude = query.longitude
    }

    const merchants = await this.redis.fetch(
      `findManyForImpactCursorPaginatedAndCount:${JSON.stringify(
        query.pagination,
      )}:${latitude!}:${longitude!}:${query.advantageForm}:${
        query.pointOfSaleType
      }:${query.radius}`,
      CacheTimes.OneHour * 4,
      async () => {
        return this.merchantRepo.findManyForImpactCursorPaginatedAndCount(
          query.pagination,
          new Coords({
            latitude: latitude!,
            longitude: longitude!,
          }),
          query.advantageForm,
          query.pointOfSaleType,
          query.radius,
        )
      },
    )
    merchants.data.map((merchant) =>
      merchant.advantage
        ? (merchant.advantage.value = organization.offer.advantageInShops)
        : null,
    )
    return Result.ok(merchants)
  }
}
