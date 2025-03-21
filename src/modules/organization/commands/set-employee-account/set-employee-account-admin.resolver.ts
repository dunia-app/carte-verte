import { fakerFR as faker } from '@faker-js/faker'
import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { CreateVirtualCardCommand } from '../../../card/commands/create-virtual-card/create-virtual-card.command'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { EmployeeRepository } from '../../database/employee/employee.repository'
import {
  EmployeeAlreadyActivatedError,
  EmployeeAlreadyExistsError,
  EmployeeCodeFormatNotCorrectError,
  EmployeeFrozenError,
} from '../../errors/employee.errors'
import { AcceptCguCommand } from '../accept-cgu/accept-cgu.command'
import { SetEmployeeAccountAdminRequest } from './set-employee-account-admin.request.dto'
import { SetEmployeeAccountCommand } from './set-employee-account.command'

@ObjectType()
class SetEmployeeAccountAdminResponse extends ErrorWithResponse(
  [
    EmployeeCodeFormatNotCorrectError,
    EmployeeAlreadyActivatedError,
    EmployeeAlreadyExistsError,
    EmployeeFrozenError,
  ],
  'SetEmployeeAccountAdminErrorUnion',
  String,
) {}

@Resolver()
export class SetEmployeeAccountAdminGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly employeeRepo: EmployeeRepository,
  ) {}

  @AppMutation(() => SetEmployeeAccountAdminResponse, UserRoles.superAdmin, {
    description:
      'Set a code to login. Last step to employee activation process',
  })
  async setEmployeeAccountAdmin(
    @Args('input') input: SetEmployeeAccountAdminRequest,
  ): Promise<SetEmployeeAccountAdminResponse> {
    const temporaryCode = faker.string.numeric({ length:4, allowLeadingZeros: true })
    const command = new SetEmployeeAccountCommand({
      email: input.email,
      code: temporaryCode,
      mobile: input.mobile,
    })

    const resLoginResp = await this.commandBus.execute(command)
    if (resLoginResp.isErr) {
      return new SetEmployeeAccountAdminResponse(Result.err(resLoginResp.error))
    }

    const acceptCguCommand = new AcceptCguCommand({
      employeeId: resLoginResp.value.employeeId.value,
    })
    await this.commandBus.execute(acceptCguCommand)
    const employee = await this.employeeRepo.findOneByIdOrThrow(
      resLoginResp.value.employeeId.value,
    )
    const createVirtualCardCommand = new CreateVirtualCardCommand({
      employeeId: resLoginResp.value.employeeId.value,
      externalEmployeeId: employee.externalEmployeeId!,
      design: input.design,
    })
    const createCardRes = await this.commandBus.execute(
      createVirtualCardCommand,
    )

    if (createCardRes.isErr) {
      return new SetEmployeeAccountAdminResponse(
        Result.err(createCardRes.error),
      )
    }

    return new SetEmployeeAccountAdminResponse(Result.ok(temporaryCode))
  }
}