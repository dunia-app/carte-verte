import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { CardAcquisitionServiceError } from '../../../../libs/ddd/domain/ports/card-acquisition-service.port'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { EmployeeEntity } from '../../../organization/domain/entities/employee.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { RequestCardAcquisitionLinkResponse } from '../../dtos/card-acquisition.dto'
import { CardAcquisitionNoAuthorizedOverdraftError } from '../../errors/card-acquisition.errors'
import { WalletAlreadyExistsError } from '../../errors/wallet.errors'
import { RequestExternalCardAcquisitionLinkCommand } from './request-external-card-acquisition-link.command'
import { RequestExternalCardAcquisitionLinkRequest } from './request-external-card-acquisition-link.request.dto'

@ObjectType()
class RequestExternalCardAcquisitionLinkResponse extends ErrorWithResponse(
  [
    WalletAlreadyExistsError,
    CardAcquisitionServiceError,
    CardAcquisitionNoAuthorizedOverdraftError,
  ],
  'RequestExternalCardAcquisitionLinkErrorUnion',
  RequestCardAcquisitionLinkResponse,
) {}

@Resolver()
export class RequestExternalCardAcquisitionLinkGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(
    () => RequestExternalCardAcquisitionLinkResponse,
    UserRoles.employee,
  )
  async requestExternalCardAcquisitionLink(
    @CurrentUser() employee: EmployeeEntity,
    @Args('input') input: RequestExternalCardAcquisitionLinkRequest,
  ): Promise<RequestExternalCardAcquisitionLinkResponse> {
    const command = new RequestExternalCardAcquisitionLinkCommand({
      employeeId: employee.id.value,
      externalEmployeeId: employee.externalEmployeeId!,
      authorizedOverdraft: input.authorizedOverdraft,
    })

    const res = await this.commandBus.execute(command)

    return new RequestExternalCardAcquisitionLinkResponse(res)
  }
}
