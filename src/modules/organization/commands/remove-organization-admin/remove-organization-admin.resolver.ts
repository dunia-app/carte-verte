import { ParseUUIDPipe } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationAdminIsTheLastOneError } from '../../errors/organization-admin.errors'
import { RemoveOrganizationAdminCommand } from './remove-organization-admin.command'

@ObjectType()
class RemoveOrganizationAdminResponse extends ErrorWithResponse(
  [OrganizationAdminIsTheLastOneError],
  'RemoveOrganizationAdminErrorUnion',
  String,
) {}

@Resolver()
export class RemoveOrganizationAdminGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(
    () => RemoveOrganizationAdminResponse,
    UserRoles.organizationAdmin,
  )
  async removeOrganizationAdmin(
    @CurrentOrganizationId() organizationId: string,
    @Args('organizationAdminId', ParseUUIDPipe) organizationAdminId: string,
  ): Promise<RemoveOrganizationAdminResponse> {
    const command = new RemoveOrganizationAdminCommand({
      organizationId: organizationId,
      organizationAdminId: organizationAdminId,
    })

    const res = await this.commandBus.execute(command)

    return new RemoveOrganizationAdminResponse(res)
  }
}
