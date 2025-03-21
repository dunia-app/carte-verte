import { Result } from '@badrap/result'
import { fakerFR as faker } from '@faker-js/faker'
import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { OrganizationAdminAlreadyExistsError } from '../../errors/organization-admin.errors'
import { SetOrganizationAdminPasswordCommand } from '../set-organization-admin-password/set-organization-admin-password.command'
import { AddOrganizationAdminAdminRequest } from './add-organization-admin-admin.request.dto'
import { AddOrganizationAdminCommand } from './add-organization-admin.command'

@ObjectType()
class AddOrganizationAdminAdminResponse extends ErrorWithResponse(
  [OrganizationAdminAlreadyExistsError],
  'AddOrganizationAdminAdminErrorUnion',
  String,
) {}

@Resolver()
export class AddOrganizationAdminAdminGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => AddOrganizationAdminAdminResponse, UserRoles.superAdmin)
  async addOrganizationAdminAdmin(
    @Args('input') input: AddOrganizationAdminAdminRequest,
  ): Promise<AddOrganizationAdminAdminResponse> {
    const command = new AddOrganizationAdminCommand({
      email: input.email,
      firstname: input.firstname,
      lastname: input.lastname,
      organizationId: input.organizationId,
      sendCreationEvent: false,
    })

    const res = await this.commandBus.execute(command)

    if (res.isErr) {
      return new AddOrganizationAdminAdminResponse(res)
    }

    const specialCharacters = ['!', '?', '@', '#', '$', '%', '^', '&', '-']

    const temporaryPassword =
      faker.string.alpha(12) +
      faker.number.int(9) +
      specialCharacters[faker.number.int(specialCharacters.length - 1)]

    const setPasswordCommand = new SetOrganizationAdminPasswordCommand({
      email: input.email,
      password: temporaryPassword,
    })

    const setPasswordRes = await this.commandBus.execute(setPasswordCommand)

    if (setPasswordRes.isErr) {
      return new AddOrganizationAdminAdminResponse(
        Result.err(setPasswordRes.error),
      )
    }

    return new AddOrganizationAdminAdminResponse(Result.ok(temporaryPassword))
  }
}