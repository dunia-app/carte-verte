import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { PlaceNotFoundError } from '../../../../infrastructure/place-autocomplete/find-place/find-place.errors'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { PointOfSaleResponse } from '../../dtos/merchant.response.dto'
import { FindPointOfSaleQuery } from './find-point-of-sale.query'
import { FindPointOfSaleRequest } from './find-point-of-sale.request.dto'

@ObjectType()
class FindPointOfSaleResponse extends ErrorWithResponse(
  [PlaceNotFoundError],
  'FindPointOfSaleErrorUnion',
  PointOfSaleResponse,
) {}

@Resolver()
export class FindPointOfSaleGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => FindPointOfSaleResponse, UserRoles.employee)
  async findPointOfSale(
    @CurrentUser() employee: EmployeeEntity,
    @Args('input') input: FindPointOfSaleRequest,
  ): Promise<FindPointOfSaleResponse> {
    const query = new FindPointOfSaleQuery({
      pointOfSaleId: input.pointOfSaleId,
      organizationId: employee.organizationId.value,
    })
    const res = await this.queryBus.execute(query)

    return new FindPointOfSaleResponse(res)
  }
}
