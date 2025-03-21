import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ReceiverRepository } from '../../../message/database/receiver/receiver.repository'
import { OrganizationAdminRepository } from '../../database/organization-admin/organization-admin.repository'
import { OrganizationAdminPasswordFormatNotCorrectError } from '../../errors/organization-admin.errors'
import { ValidateOrganizationAdminPasswordQuery } from './validate-organization-admin-password.query'

@QueryHandler(ValidateOrganizationAdminPasswordQuery)
export class ValidateOrganizationAdminPasswordQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly organizationAdminRepo: OrganizationAdminRepository,
    private readonly receiverRepo: ReceiverRepository,
  ) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves organizationAdmins directly from a repository.
   */
  async handle(
    query: ValidateOrganizationAdminPasswordQuery,
  ): Promise<Result<boolean, OrganizationAdminPasswordFormatNotCorrectError>> {
    const receiver = await this.receiverRepo.findOneByEmailOrThrow(query.email)
    const organizationAdmin =
      await this.organizationAdminRepo.findOneByUserIdOrThrow(
        receiver.userId.value,
      )

    const isPasswordValid = organizationAdmin.validatePasswordFormat(
      query.password,
    )
    if (isPasswordValid.isErr) {
      return Result.err(isPasswordValid.error)
    }
    return Result.ok(true)
  }
}
