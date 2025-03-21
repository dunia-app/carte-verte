import { QueryHandler } from '@nestjs/cqrs'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { ReceiverRepository } from '../../../message/database/receiver/receiver.repository'
import { OrganizationAdminRepository } from '../../database/organization-admin/organization-admin.repository'
import { OrganizationAdminStatus } from '../../domain/entities/organization-admin.types'
import { OrganizationAdminStatusQuery } from './organization-admin-status.query'

@QueryHandler(OrganizationAdminStatusQuery)
export class OrganizationAdminStatusQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly organizationAdminRepo: OrganizationAdminRepository,
    private readonly receiverRepo: ReceiverRepository,
    private readonly redis: RedisService,
  ) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves organizationAdmins directly from a repository.
   */
  async handle(
    query: OrganizationAdminStatusQuery,
  ): Promise<Result<OrganizationAdminStatus, ExceptionBase>> {
    const receiver = await this.receiverRepo.findOneByEmailOrThrow(query.email)
    const organizationAdmin =
      await this.organizationAdminRepo.findOneByUserIdOrThrow(
        receiver.userId.value,
      )
    if (
      organizationAdmin.status ===
      OrganizationAdminStatus.ORGANIZATION_ADMIN_ACTIVE
    ) {
      //Check for password reset requets
      const cacheResult = await this.redis.persist.get(query.email)
      if (cacheResult) {
        return Result.ok(
          OrganizationAdminStatus.ORGANIZATION_ADMIN_ACTIVE_RESET_CODE,
        )
      }
    }
    return Result.ok(organizationAdmin.status)
  }
}
