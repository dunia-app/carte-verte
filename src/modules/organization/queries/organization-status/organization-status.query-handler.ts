import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { OrganizationRepository } from '../../database/organization/organization.repository'
import { OrganizationStatus } from '../../domain/entities/organization.types'
import { OrganizationStatusQuery } from './organization-status.query'

@QueryHandler(OrganizationStatusQuery)
export class OrganizationStatusQueryHandler extends QueryHandlerBase {
  constructor(private readonly organizationRepo: OrganizationRepository) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves organizations directly from a repository.
   */
  async handle(
    query: OrganizationStatusQuery,
  ): Promise<Result<OrganizationStatus, ExceptionBase>> {
    const organization = await this.organizationRepo.findOneByIdOrThrow(
      query.organizationId,
    )
    return Result.ok(organization.status)
  }
}
