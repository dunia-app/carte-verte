import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { CurrentUser } from '../../../../libs/decorators/application.decorator'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationAdminEntity } from '../../domain/entities/organization-admin.entity'
import { UpdateOrgnanizationAdminPasswordCommand } from './update-organization-admin-password.command'
import { UpdateOrganizationAdminPasswordRequest } from './update-organization-admin-password.request.dto'

@ObjectType()
class UpdateOrgnanizationAdminPasswordResponse extends ErrorWithResponse(
  [],
  'UpdateOrgnanizationAdminPasswordErrorUnion',
  String,
) {}

@Resolver()
export class UpdateOrgnanizationAdminPasswordGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(
    () => UpdateOrgnanizationAdminPasswordResponse,
    UserRoles.organizationAdmin,
  )
  async updateOrganizationAdminPassword(
    @CurrentUser() organizationAdmin: OrganizationAdminEntity,
    @Args('input') input: UpdateOrganizationAdminPasswordRequest,
  ): Promise<UpdateOrgnanizationAdminPasswordResponse> {
    const command = new UpdateOrgnanizationAdminPasswordCommand({
      organizationAdminId: organizationAdmin.id,
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    })

    const res = await this.commandBus.execute(command)

    return new UpdateOrgnanizationAdminPasswordResponse(res)
  }
}
