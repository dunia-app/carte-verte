import { QueryHandler } from '@nestjs/cqrs'
import { PlaceNotFoundError } from '../../../../infrastructure/place-autocomplete/find-place/find-place.errors'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { OrganizationRepository } from '../../../organization/database/organization/organization.repository'
import { MerchantRepository } from '../../database/merchant/merchant.repository'
import { PointOfSaleResponse } from '../../dtos/merchant.response.dto'
import { FindPointOfSaleQuery } from './find-point-of-sale.query'

@QueryHandler(FindPointOfSaleQuery)
export class FindPointOfSaleQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly merchantRepo: MerchantRepository,
    private readonly organizationRepo: OrganizationRepository,
  ) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves merchants directly from a repository.
   */
  async handle(
    query: FindPointOfSaleQuery,
  ): Promise<Result<PointOfSaleResponse, PlaceNotFoundError>> {
    const organization = await this.organizationRepo.findOneByIdOrThrow(
      query.organizationId,
    )
    const merchant = await this.merchantRepo.findOneForImpactOrThrow(
      query.pointOfSaleId,
    )
    merchant.advantage
      ? (merchant.advantage.value = organization.offer.advantageInShops)
      : null
    return Result.ok(merchant)
  }
}
