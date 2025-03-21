import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { PlaceNotFoundError } from '../../../../infrastructure/place-autocomplete/find-place/find-place.errors'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { PointOfSalesResponse } from '../../dtos/merchant.response.dto'
import { FindPointOfSalesQuery } from './find-point-of-sales.query'
import { FindPointOfSalesRequest } from './find-point-of-sales.request.dto'

@ObjectType()
class FindPointOfSalesResponse extends ErrorWithResponse(
  [PlaceNotFoundError],
  'FindPointOfSalesErrorUnion',
  PointOfSalesResponse,
) {}

@Resolver()
export class FindPointOfSalesGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => FindPointOfSalesResponse, UserRoles.employee)
  async findPointOfSales(
    @CurrentUser() employee: EmployeeEntity,
    @Args('input') input: FindPointOfSalesRequest,
  ): Promise<FindPointOfSalesResponse> {
    const query = new FindPointOfSalesQuery({
      pagination: input.pagination,
      organizationId: employee.organizationId.value,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      advantageForm: input.advantageForm,
      pointOfSaleType: input.pointOfSaleType,
      radius: input.radius,
    })
    const res = await this.queryBus.execute(query)

    return new FindPointOfSalesResponse(res)
  }
}
