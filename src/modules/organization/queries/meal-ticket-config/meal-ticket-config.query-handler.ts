import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { OrganizationRepository } from '../../../../modules/organization/database/organization/organization.repository'
import { OrganizationSettings } from '../../domain/value-objects/organization-settings.value-object'
import { OrganizationHasNoSettingsError } from '../../errors/organization.errors'
import { MealTicketConfigQuery } from './meal-ticket-config.query'

@QueryHandler(MealTicketConfigQuery)
export class MealTicketConfigQueryHandler extends QueryHandlerBase {
  constructor(private readonly organizationRepo: OrganizationRepository) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves organizations directly from a repository.
   */
  async handle(
    query: MealTicketConfigQuery,
  ): Promise<Result<OrganizationSettings, OrganizationHasNoSettingsError>> {
    const organization = await this.organizationRepo.findOneByIdOrThrow(
      query.organizationId,
    )

    return organization.settings
      ? Result.ok(organization.settings)
      : Result.err(new OrganizationHasNoSettingsError())
  }
}
