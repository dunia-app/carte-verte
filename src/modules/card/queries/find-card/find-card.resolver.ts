import { QueryBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import {
  CurrentUser,
  HasQueryAttributeMap,
} from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { CardResponse } from '../../../../modules/card/dtos/card.response.dto'
import { EmployeeEntity } from '../../../../modules/organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CardNotFoundError } from '../../errors/card.errors'
import { FindCardQuery } from './find-card.query'

@ObjectType()
class FindCardResponse extends ErrorWithResponse(
  [CardNotFoundError],
  'FindCardErrorUnion',
  CardResponse,
) {}

@Resolver()
export class FindCardGraphqlResolver {
  constructor(
    private readonly queryBus: QueryBus,
    protected readonly unitOfWork: UnitOfWork,
  ) {}

  @AppQuery(() => FindCardResponse, UserRoles.employee)
  async findCard(
    @CurrentUser() employee: EmployeeEntity,
    @HasQueryAttributeMap() hasAttributeMap: Map<string, boolean>,
  ): Promise<FindCardResponse> {
    const query = new FindCardQuery({
      employeeId: employee.id.value,
      organizationId: hasAttributeMap.has('result.physicalCardPrice')
        ? employee.organizationId.value
        : undefined,
      addMaskedPan:
        hasAttributeMap.has('result.maskedPan') ||
        hasAttributeMap.has('result.embossedName'),
      addIsPinLocked: hasAttributeMap.has('result.isPinLocked'),
    })

    const res = await this.queryBus.execute(query)
    if (res.isErr) {
      return new FindCardResponse(Result.err(res.error))
    }
    return new FindCardResponse(Result.ok(res.value))
  }
}
