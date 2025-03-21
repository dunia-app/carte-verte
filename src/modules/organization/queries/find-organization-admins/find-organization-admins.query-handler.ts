import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { DataWithPaginationMeta } from '../../../../libs/ddd/domain/ports/repository.ports'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { OrganizationAdminRepository } from '../../database/organization-admin/organization-admin.repository'
import { FindOrganizationAdminResponseProps } from '../../dtos/organization-admin.response.dto'
import { FindOrganizationAdminsQuery } from './find-organization-admins.query'

@QueryHandler(FindOrganizationAdminsQuery)
export class FindOrganizationAdminsQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly organizationAdminRepo: OrganizationAdminRepository,
  ) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves organizationAdmins directly from a repository.
   */
  async handle(
    query: FindOrganizationAdminsQuery,
  ): Promise<
    Result<
      DataWithPaginationMeta<FindOrganizationAdminResponseProps[]>,
      ExceptionBase
    >
  > {
    const organizationAdmins =
      await this.organizationAdminRepo.findManyWithInfoByOrganizationId(
        query.organizationId,
        query.limit,
        query.offset,
      )
    return Result.ok(organizationAdmins)
  }
}
