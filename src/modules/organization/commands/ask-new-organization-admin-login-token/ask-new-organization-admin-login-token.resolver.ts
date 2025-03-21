import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { OrganizationAdminAlreadyActivatedError } from '../../errors/organization-admin.errors'
import { AskNewOrganizationAdminLoginTokenCommand } from './ask-new-organization-admin-login-token.command'
const Sentry = require('@sentry/node')


@ObjectType()
class AskNewOrganizationAdminLoginTokenResponse extends ErrorWithResponse(
  [OrganizationAdminAlreadyActivatedError],
  'AskNewOrganizationAdminLoginTokenErrorUnion',
  Boolean,
) {}

@Resolver()
export class AskNewOrganizationAdminLoginTokenGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => AskNewOrganizationAdminLoginTokenResponse, false)
  async askNewOrganizationAdminLoginToken(
    @Args('email') email: string,
  ): Promise<AskNewOrganizationAdminLoginTokenResponse> {
    Sentry.setUser({
      email: email
    })

    const command = new AskNewOrganizationAdminLoginTokenCommand({
      email: email,
    })

    const res = await this.commandBus.execute(command)
    return new AskNewOrganizationAdminLoginTokenResponse(res)
  }
}
