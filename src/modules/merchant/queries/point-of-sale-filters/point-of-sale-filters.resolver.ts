import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { PointOfSaleFilterResponse } from '../../dtos/merchant-filter.response.dto'
import { PointOfSaleFiltersQuery } from './point-of-sale-filters.query'
import { PointOfSaleFiltersRequest } from './point-of-sale-filters.request.dto'

@ObjectType()
class PointOfSaleFiltersResponse extends ErrorWithResponse(
  [],
  'PointOfSaleFiltersErrorUnion',
  [PointOfSaleFilterResponse],
) {}

@Resolver()
export class PointOfSaleFiltersGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => PointOfSaleFiltersResponse, UserRoles.employee)
  async pointOfSaleFilters(
    @Args('input') input: PointOfSaleFiltersRequest,
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<PointOfSaleFiltersResponse> {
    const query = new PointOfSaleFiltersQuery({
      employeeId: employee.id.value,
      advantage: input.advantage,
    })
    const res = await this.queryBus.execute(query)

    return new PointOfSaleFiltersResponse(res)
  }
}
