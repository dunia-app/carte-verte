import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { AdvantageRepository } from '../../database/advantage/advantage.repository'
import { MerchantFilterRepository } from '../../database/merchant-filter/merchant-filter.repository'
import { AdvantageType } from '../../domain/entities/advantage.types'
import { MerchantFilterEntity } from '../../domain/entities/merchant-filter.entity'
import { PointOfSaleFilterResponse } from '../../dtos/merchant-filter.response.dto'
import { PointOfSaleFiltersQuery } from './point-of-sale-filters.query'

@QueryHandler(PointOfSaleFiltersQuery)
export class PointOfSaleFiltersQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly merchantFilterRepo: MerchantFilterRepository,
    private readonly advantageRepo: AdvantageRepository,
  ) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves MerchantFilters directly from a repository.
   */
  async handle(
    query: PointOfSaleFiltersQuery,
  ): Promise<Result<PointOfSaleFilterResponse[], ExceptionBase>> {
    if (!query.advantage) {
      return Result.ok(
        (await this.advantageRepo.findManyByEmployeeId(query.employeeId))
          .map((advantage) => {
            return {
              code: advantage.type,
              name: this.advantageToMerchantFilterName(advantage.type),
            }
          })
          .filter((advantage) => advantage.code !== AdvantageType.EXTERNAL),
      )
    }
    const merchantFilters = await this.merchantFilterRepo.findManyByParentCode(
      query.advantage,
    )
    merchantFilters.push(MerchantFilterEntity.getOtherFilter(query.advantage))
    return Result.ok(
      merchantFilters.map((merchantFilter) => {
        return {
          code: merchantFilter.code,
          name: merchantFilter.name,
        }
      }),
    )
  }

  private advantageToMerchantFilterName(advantage: AdvantageType) {
    switch (advantage) {
      case AdvantageType.MEALTICKET:
        return 'Alimentation'
      case AdvantageType.NONE:
        return 'Bons plans'
      default:
        return 'Other'
    }
  }
}
