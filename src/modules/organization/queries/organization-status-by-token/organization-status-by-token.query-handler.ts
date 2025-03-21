import { QueryHandler } from '@nestjs/cqrs'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { ReceiverRepository } from '../../../message/database/receiver/receiver.repository'
import { OrganizationAdminRepository } from '../../database/organization-admin/organization-admin.repository'
import { OrganizationRepository } from '../../database/organization/organization.repository'
import { OrganizationStatus } from '../../domain/entities/organization.types'
import { OrganizationIdIsMissingError } from '../../errors/organization-admin.errors'
import { OrganizationStatusByTokenQuery } from './organization-status-by-token.query'

@QueryHandler(OrganizationStatusByTokenQuery)
export class OrganizationStatusByTokenQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly organizationRepo: OrganizationRepository,
    private readonly receiverRepo: ReceiverRepository,
    private readonly organizationAdminRepo: OrganizationAdminRepository,
    private readonly redisService: RedisService,
  ) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves organizations directly from a repository.
   */
  async handle(
    query: OrganizationStatusByTokenQuery,
  ): Promise<Result<OrganizationStatus, ExceptionBase>> {
    const cacheResult = await this.redisService.persist.get(query.token)
    if (cacheResult === null) {
      throw new Error('Token expired. Try again')
    } else {
      const tokenInfo = JSON.parse(cacheResult)
      const receiver = await this.receiverRepo.findOneByEmailOrThrow(
        tokenInfo.email,
      )
      const organizationAdmin =
        await this.organizationAdminRepo.findOneByUserIdOrThrow(
          receiver.userId.value,
        )
      if (
        !organizationAdmin.isOrganizationAccessible(
          new UUID(query.organizationId),
        )
      ) {
        return Result.err(new OrganizationIdIsMissingError())
      }
      const organization = await this.organizationRepo.findOneByIdOrThrow(
        query.organizationId,
      )
      return Result.ok(organization.status)
    }
  }
}
