import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { HasQueryAttributeMap } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeDeviceValidationResponse } from '../../dtos/employee.response.dto'
import { EmployeeDeviceValidationInfoQuery } from './employee-device-validation-info.query'
import { EmployeeDeviceValidationInfoRequest } from './employee-device-validation-info.request.dto'

@ObjectType()
class EmployeeDeviceValidationInfoResponse extends ErrorWithResponse(
  [],
  'EmployeeDeviceValidationInfoErrorUnion',
  EmployeeDeviceValidationResponse,
) {}

@Resolver()
export class EmployeeDeviceValidationInfoGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => EmployeeDeviceValidationInfoResponse, false)
  async employeeDeviceValidationInfo(
    @Args('input') input: EmployeeDeviceValidationInfoRequest,
    @HasQueryAttributeMap() hasAttributeMap: Map<string, boolean>,
  ): Promise<EmployeeDeviceValidationInfoResponse> {
    const query = new EmployeeDeviceValidationInfoQuery({
      email: input.email,
      addPhoneNumber: hasAttributeMap.has('result.phoneNumber'),
    })
    const res = await this.queryBus.execute(query)

    return new EmployeeDeviceValidationInfoResponse(res)
  }
}
