import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationInfoResponse } from '../../dtos/organization.response.dto'
import { CreateNewOrganizationAdminCommand } from './create-new-organization-admin.command'
import { CreateNewOrganizationAdminRequest } from './create-new-organization-admin.request.dto'

@ObjectType()
class CreateNewOrganizationAdminResponseError extends ErrorWithResponse(
  [],
  'CreateNewOrganizationAdminErrorUnion',
  OrganizationInfoResponse,
) {}

@Resolver()
export class CreateNewOrganizationAdminGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(
    () => CreateNewOrganizationAdminResponseError,
    UserRoles.superAdmin,
  )
  async createNewOrganizationAdmin(
    @Args('input') input: CreateNewOrganizationAdminRequest,
  ): Promise<CreateNewOrganizationAdminResponseError> {
    const command = new CreateNewOrganizationAdminCommand({
      email: input.email,
      firstname: input.firstname,
      lastname: input.lastname,
      organizationName: input.organizationName,
      commission: input.commission,
      commissionType: input.commissionType,
      advantageInShops: input.advantageInShops,
      physicalCardPrice: input.physicalCardPrice,
      firstPhysicalCardPrice: input.firstPhysicalCardPrice,
      physicalCardCoverage: input.physicalCardCoverage,
      firstPhysicalCardCoverage: input.firstPhysicalCardCoverage,
    })

    const res = await this.commandBus.execute(command)
    if (res.isErr) {
      return new CreateNewOrganizationAdminResponseError(Result.err(res.error))
    }
    return new CreateNewOrganizationAdminResponseError(
      Result.ok(new OrganizationInfoResponse(res.value)),
    )
  }
}
