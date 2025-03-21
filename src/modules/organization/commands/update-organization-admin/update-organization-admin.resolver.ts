import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationAdminNotFoundError } from '../../errors/organization-admin.errors'
import { UpdateOrganizationAdminCommand } from './update-organization-admin.command'
import { UpdateOrganizationAdminRequest } from './update-organization-admin.request.dto'

@ObjectType()
class UpdateOrganizationAdminResponse extends ErrorWithResponse(
  [OrganizationAdminNotFoundError],
  'UpdateOrganizationAdminErrorUnion',
  String,
) {}

@Resolver()
export class UpdateOrganizationAdminGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(
    () => UpdateOrganizationAdminResponse,
    UserRoles.organizationAdmin,
  )
  async updateOrganizationAdmin(
    @Args('input') input: UpdateOrganizationAdminRequest,
  ): Promise<UpdateOrganizationAdminResponse> {
    const command = new UpdateOrganizationAdminCommand({
      organizationAdminId: input.organizationAdminId,
      firstname: input.firstname,
      lastname: input.lastname,
      email: input.email,
    })

    const res = await this.commandBus.execute(command)

    return new UpdateOrganizationAdminResponse(res)
  }
}
