import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeStatus } from '../../domain/entities/employee.types'
import { EmployeeNotFoundError } from '../../errors/employee.errors'
import { EmployeeStatusQuery } from './employee-status.query'

@ObjectType()
class EmployeeStatusResponse extends ErrorWithResponse(
  [EmployeeNotFoundError],
  'EmployeeStatusErrorUnion',
  EmployeeStatus,
) {}

@Resolver()
export class EmployeeStatusGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  // TO do throttle
  @AppQuery(() => EmployeeStatusResponse, false)
  async employeeStatus(
    @Args('email') email: string,
    // TO DO: nullable is to be deprecated and deviceId will be mandatory
    @Args('deviceId', { nullable: true }) deviceId?: string,
  ): Promise<EmployeeStatusResponse> {
    const query = new EmployeeStatusQuery({
      email: email,
      deviceId: deviceId,
    })
    const res = await this.queryBus.execute(query)
    return new EmployeeStatusResponse(res)
  }
}
