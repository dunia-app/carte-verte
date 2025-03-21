import { QueryBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { WalletResponse } from '../../dtos/wallet.response.dto'
import { FindWalletQuery } from './find-wallet.query'

@ObjectType()
class FindWalletResponse extends ErrorWithResponse(
  [],
  'FindWalletErrorUnion',
  WalletResponse,
) {}

@Resolver()
export class FindWalletGraphqlResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @AppQuery(() => FindWalletResponse, UserRoles.employee)
  async findWallet(
    @CurrentUser() employee: EmployeeEntity,
  ): Promise<FindWalletResponse> {
    const query = new FindWalletQuery({
      employeeId: employee.id.value,
    })
    const res = await this.queryBus.execute(query)

    return new FindWalletResponse(res)
  }
}
