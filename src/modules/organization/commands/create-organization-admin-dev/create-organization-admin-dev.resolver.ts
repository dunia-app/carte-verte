import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutationDev } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationAdminAlreadyExistsError } from '../../errors/organization-admin.errors'
import { CreateOrganizationAdminDevCommand } from './create-organization-admin-dev.command'
import { CreateOrganizationAdminDevRequest } from './create-organization-admin-dev.request.dto'

@ObjectType()
class CreateOrganizationAdminDevResponse extends ErrorWithResponse(
  [OrganizationAdminAlreadyExistsError],
  'CreateOrganizationAdminDevErrorUnion',
  String,
) {}

@Resolver()
export class CreateOrganizationAdminDevGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutationDev(
    () => CreateOrganizationAdminDevResponse,
    UserRoles.superAdmin,
    {
      description:
        'create an organization admin. Return email token (Dev only)',
    },
  )
  async createOrganizationAdminDev(
    @Args('input') input: CreateOrganizationAdminDevRequest,
  ): Promise<CreateOrganizationAdminDevResponse> {
    const command = new CreateOrganizationAdminDevCommand({
      email: input.email,
      firstname: input.firstname,
      lastname: input.lastname,
    })

    const res = await this.commandBus.execute(command)

    return new CreateOrganizationAdminDevResponse(res)
  }
}
