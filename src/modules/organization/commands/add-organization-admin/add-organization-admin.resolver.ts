import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentOrganizationId } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationAdminAlreadyExistsError } from '../../errors/organization-admin.errors'
import { AddOrganizationAdminCommand } from './add-organization-admin.command'
import { AddOrganizationAdminRequest } from './add-organization-admin.request.dto'

@ObjectType()
class AddOrganizationAdminResponse extends ErrorWithResponse(
  [OrganizationAdminAlreadyExistsError],
  'AddOrganizationAdminErrorUnion',
  String,
) {}

@Resolver()
export class AddOrganizationAdminGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => AddOrganizationAdminResponse, UserRoles.organizationAdmin)
  async addOrganizationAdmin(
    @CurrentOrganizationId() organizationId: string,
    @Args('input') input: AddOrganizationAdminRequest,
  ): Promise<AddOrganizationAdminResponse> {
    const command = new AddOrganizationAdminCommand({
      email: input.email,
      firstname: input.firstname,
      lastname: input.lastname,
      organizationId: organizationId,
      sendCreationEvent: true,
    })

    const res = await this.commandBus.execute(command)

    return new AddOrganizationAdminResponse(res)
  }
}
