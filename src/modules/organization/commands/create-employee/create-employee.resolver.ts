import { CommandBus } from '@nestjs/cqrs'
import { Args, Field, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { EmailNotValideError } from '../../../../libs/ddd/domain/value-objects/email.error'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../../modules/user/domain/entities/user.types'
import {
  EmployeeAlreadyExistsError,
  EmployeeEmailDuplicatedError,
  EmployeeNameNotValideError,
} from '../../errors/employee.errors'
import { CreateEmployeeCommand } from './create-employee.command'
import { CreateEmployeeRequest } from './create-employee.request.dto'

@ObjectType()
export class CreateEmployeeResponse extends ErrorWithResponse(
  [
    EmployeeAlreadyExistsError,
    EmployeeEmailDuplicatedError,
    EmployeeNameNotValideError,
    EmailNotValideError,
  ],
  'CreateEmployeeErrorUnion',
  String,
) {
  // TO DO : create response objetc that is result and not have email next to result like that
  constructor(email: string, result: any) {
    super(result)
    this.email = email
  }
  @Field(() => String)
  email: string
}

@Resolver()
export class CreateEmployeeGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => [CreateEmployeeResponse], UserRoles.organizationAdmin)
  async createEmployee(
    @CurrentOrganizationId() organizationId: string,
    @Args('input', { type: () => [CreateEmployeeRequest] })
    input: CreateEmployeeRequest[],
  ): Promise<CreateEmployeeResponse[]> {
    const command = new CreateEmployeeCommand({
      employeeCommand: input.map((employeeReq) => {
        return {
          organizationId: employeeReq.organizationId ?? organizationId,
          email: employeeReq.email,
          firstname: employeeReq.firstname,
          lastname: employeeReq.lastname,
          birthday: employeeReq.birthday,
          mealTicketDays: employeeReq.mealTicketDays,
          defaultAuthorizedOverdraft: employeeReq.defaultAuthorizedOverdraft,
        }
      }),
    })

    const res = await this.commandBus.execute(command)
    return res.unwrap().map((employee) => {
      if (employee.res.isErr) {
        return new CreateEmployeeResponse(
          employee.email,
          Result.err(employee.res.error),
        )
      }
      return new CreateEmployeeResponse(
        employee.email,
        Result.ok(employee.res.value.value),
      )
    })
  }
}
