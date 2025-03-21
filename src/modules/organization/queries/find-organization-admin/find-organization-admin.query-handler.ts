import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { OrganizationAdminRepository } from '../../database/organization-admin/organization-admin.repository'
import { FindOrganizationAdminResponseProps } from '../../dtos/organization-admin.response.dto'
import { FindOrganizationAdminQuery } from './find-organization-admin.query'

@QueryHandler(FindOrganizationAdminQuery)
export class FindOrganizationAdminQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly organizationAdminRepo: OrganizationAdminRepository,
  ) {
    super()
  }

  async handle(
    query: FindOrganizationAdminQuery,
  ): Promise<Result<FindOrganizationAdminResponseProps, ExceptionBase>> {
    const organizationAdmin =
      await this.organizationAdminRepo.findOneWithInfoByIdAndOrganizationId(
        query.organizationAdminId,
        query.organizationId,
      )

    if (!organizationAdmin) {
      throw new Error('Organization admin not found')
    }

    return Result.ok(organizationAdmin)
  }
}
