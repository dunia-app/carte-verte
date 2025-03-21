import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { OrganizationAdminRepositoryPort } from '../../database/organization-admin/organization-admin.repository.port'
import { OrganizationAdminLoginResp } from '../../dtos/organization-admin.response.dto'
import {
  OrganizationAdminNotActivatedError,
  OrganizationAdminRefreshTokenError,
} from '../../errors/organization-admin.errors'
import { RefreshOrganizationAdminTokenCommand } from './refresh-organization-admin-token.command'

export async function refreshOrganizationAdminToken(
  command: RefreshOrganizationAdminTokenCommand,
  unitOfWork: UnitOfWork,
  config: ConfigService,
): Promise<
  Result<
    OrganizationAdminLoginResp,
    OrganizationAdminRefreshTokenError | OrganizationAdminNotActivatedError
  >
> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const organizationAdminRepo: OrganizationAdminRepositoryPort =
    unitOfWork.getOrganizationAdminRepository(command.correlationId)

  const found = await organizationAdminRepo.findOneByIdOrThrow(
    command.organizationAdminId,
  )
  const refreshToken = found.refreshToken(
    command.refreshToken,
    config.getSaltRound(),
  )
  if (refreshToken.isErr) {
    return Result.err(refreshToken.error)
  }

  await organizationAdminRepo.save(found)
  return Result.ok({
    organizationAdminId: found.id,
    refreshToken: refreshToken.value,
  })
}
