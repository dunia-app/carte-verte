import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { OrganizationRepository } from '../../database/organization/organization.repository'
import { OrganizationEntity } from '../../domain/entities/organization.entity'
import { FindAccessibleOrganizationsQuery } from './find-accessible-organizations.query'

@QueryHandler(FindAccessibleOrganizationsQuery)
export class FindAccessibleOrganizationsQueryHandler extends QueryHandlerBase {
  constructor(private readonly organizationRepo: OrganizationRepository) {
    super()
  }

  async handle(
    query: FindAccessibleOrganizationsQuery,
  ): Promise<Result<OrganizationEntity[], ExceptionBase>> {
    const organizations =
      await this.organizationRepo.findAvailableOrganizationsByAdminId(
        query.organizationAdminId,
      )

    return Result.ok(organizations)
  }
}
