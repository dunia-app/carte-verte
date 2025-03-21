import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import {
  OrganizationAdminEmailNotFound,
  OrganizationAdminNotActivatedError,
} from '../../errors/organization-admin.errors'
import { AskResetOrganizationAdminPasswordCommand } from './ask-reset-organization-admin-password.command'

@ObjectType()
class AskResetOrganizationAdminPasswordResponse extends ErrorWithResponse(
  [OrganizationAdminNotActivatedError, OrganizationAdminEmailNotFound],
  'AskResetOrganizationAdminPasswordErrorUnion',
  Boolean,
) {}

@Resolver()
export class AskResetOrganizationAdminPasswordGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => AskResetOrganizationAdminPasswordResponse, false)
  async askResetOrganizationAdminPassword(
    @Args('email') email: string,
  ): Promise<AskResetOrganizationAdminPasswordResponse> {
    const command = new AskResetOrganizationAdminPasswordCommand({
      email: email,
    })

    const res = await this.commandBus.execute(command)

    return new AskResetOrganizationAdminPasswordResponse(res)
  }
}
