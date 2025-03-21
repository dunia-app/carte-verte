import { QueryBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppQuery } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../../modules/organization/domain/entities/employee.entity'
import { EmployeeRepository } from '../../../organization/database/employee/employee.repository'
import {
  EmployeeCodeTooManyFailedAttemptError,
  EmployeeFrozenError,
  WrongEmployeeCodeError,
} from '../../../organization/errors/employee.errors'
import { UserRoles } from '../../../user/domain/entities/user.types'
import {
  CardNotFoundError,
  CardNotUnlockedError,
} from '../../errors/card.errors'
import { DisplayCardQuery } from './display-card.query'

@ObjectType()
class DisplayCardResponse extends ErrorWithResponse(
  [
    CardNotUnlockedError,
    WrongEmployeeCodeError,
    EmployeeCodeTooManyFailedAttemptError,
    EmployeeFrozenError,
    CardNotFoundError,
  ],
  'DisplayCardErrorUnion',
  String,
) {}

@Resolver()
export class DisplayCardGraphqlResolver {
  constructor(
    private readonly queryBus: QueryBus,
    protected readonly unitOfWork: UnitOfWork,
    private readonly employeeRepo: EmployeeRepository,
  ) {}

  @AppQuery(() => DisplayCardResponse, UserRoles.employee, {
    description: 'return card images as base64',
  })
  async displayCard(
    @CurrentUser() employee: EmployeeEntity,
    @Args('newVersion', { nullable: true, defaultValue: false })
    newVersion: boolean,
    @Args('employeeCode', {
      nullable: true,
      description:
        'If you want card with PAN and CVV, provide the employeeCode',
    })
    employeeCode?: string,
  ): Promise<DisplayCardResponse> {
    let emptyCardDesign = true
    if (employeeCode) {
      const checkCode = employee.checkCode(employeeCode)
      if (checkCode.isErr) {
        if (checkCode.error instanceof WrongEmployeeCodeError) {
          await this.employeeRepo.save(employee)
        }
        return new DisplayCardResponse(Result.err(checkCode.error))
      } else {
        emptyCardDesign = false
      }
    }
    const query = new DisplayCardQuery({
      employeeId: employee.id.value,
      emptyCardDesign: emptyCardDesign,
      newVersion: newVersion,
    })
    const result = await this.queryBus.execute(query)

    return new DisplayCardResponse(result)
  }
}
