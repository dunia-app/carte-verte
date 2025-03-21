import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { LoginResponse } from '../../../../libs/ddd/interface-adapters/dtos/login.response.dto'
import {
  CurrentDeviceId,
  CurrentUser
} from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { AuthService } from '../../../auth/auth.service'
import { ReceiverRepository } from '../../../message/database/receiver/receiver.repository'
import { ReceiverEntity } from '../../../message/domain/entities/receiver.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { EmployeeEntity } from '../../domain/entities/employee.entity'
import {
  EmployeeCodeFormatNotCorrectError,
  EmployeeCodeTooManyFailedAttemptError,
  EmployeeFrozenError,
  EmployeeNotActivatedError,
  WrongEmployeeCodeError,
} from '../../errors/employee.errors'
import { UpdateEmployeeCodeCommand } from './update-employee-code.command'
import { UpdateEmployeeCodeRequest } from './update-employee-code.request.dto'

@ObjectType()
class UpdateEmployeeCodeResponse extends ErrorWithResponse(
  [
    WrongEmployeeCodeError,
    EmployeeCodeTooManyFailedAttemptError,
    EmployeeCodeFormatNotCorrectError,
    EmployeeNotActivatedError,
    EmployeeFrozenError,
  ],
  'UpdateEmployeeCodeErrorUnion',
  LoginResponse,
) {}

@Resolver()
export class UpdateEmployeeCodeGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
    private readonly receiverRepo: ReceiverRepository
  ) {}

  @AppMutation(() => UpdateEmployeeCodeResponse, UserRoles.employee)
  async updateEmployeeCode(
    @CurrentUser() employee: EmployeeEntity,
    @CurrentDeviceId() deviceId: string,
    @Args('input') input: UpdateEmployeeCodeRequest,
  ): Promise<UpdateEmployeeCodeResponse> {
    const command = new UpdateEmployeeCodeCommand({
      employeeId: employee.id.value,
      currentCode: input.currentCode,
      newCode: input.newCode,
    })

    const resLoginResp = await this.commandBus.execute(command)
    if (resLoginResp.isErr) {
      return new UpdateEmployeeCodeResponse(Result.err(resLoginResp.error))
    }
    const loginResp = resLoginResp.unwrap()

    const receiver : ReceiverEntity = await this.receiverRepo.findOneByEmployeeIdOrThrow(
      employee.id.value
    );

    const jwt = this.authService.createJWT(
      loginResp.employeeId,
      UserRoles.employee,
      deviceId,
      receiver.email.value
    )
    return new UpdateEmployeeCodeResponse(
      Result.ok({
        jwtToken: jwt,
        refreshToken: loginResp.refreshToken,
      }),
    )
  }
}
