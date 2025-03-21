import { CommandBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationAlreadyAcceptedOfferError } from '../../errors/organization.errors'
import { AcceptOrganizationOfferCommand } from './accept-organization-offer.command'

@ObjectType()
class AcceptOrganizationOfferResponse extends ErrorWithResponse(
  [OrganizationAlreadyAcceptedOfferError],
  'AcceptOrganizationOfferErrorUnion',
  Boolean,
) {}

@Resolver()
export class AcceptOrganizationOfferGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(
    () => AcceptOrganizationOfferResponse,
    UserRoles.organizationAdmin,
    { deprecationReason: 'Use registerOrganizationAdmin instead' },
  )
  async acceptOrganizationOffer(
    @CurrentOrganizationId() organizationId: string,
  ): Promise<AcceptOrganizationOfferResponse> {
    const command = new AcceptOrganizationOfferCommand({
      organizationId: organizationId,
    })

    const id = await this.commandBus.execute(command)

    return new AcceptOrganizationOfferResponse(id)
  }
}
