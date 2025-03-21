import { QueryBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CardAcquisitionResponse } from '../../dtos/card-acquisition.dto'
import { FindCardAcquisitionQuery } from './find-card-acquisition.query'

@ObjectType()
class FindCardAcquisitionResponse extends ErrorWithResponse(
  [],
  'FindCardAcquisitionErrorUnion',
  CardAcquisitionResponse,
) {}

@Resolver()
export class FindCardAcquisitionGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => FindCardAcquisitionResponse, UserRoles.employee)
  async findCardAcquisition(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<FindCardAcquisitionResponse> {
    const query = new FindCardAcquisitionQuery({
      employeeId: employee.id.value,
    })
    const res = await this.queryBus.execute(query)

    return new FindCardAcquisitionResponse(res)
  }
}
