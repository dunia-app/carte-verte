import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/exception.base'
import { UpdateOrgnanizationAdminPasswordCommand } from './update-organization-admin-password.command'

export async function updateOrgnanizationAdminPassword(
  command: UpdateOrgnanizationAdminPasswordCommand,
  unitOfWork: UnitOfWork,
  configService: ConfigService,
): Promise<Result<string, ExceptionBase>> {
  const organizationAdminRepo = unitOfWork.getOrganizationAdminRepository(
    command.correlationId,
  )

  const found = await organizationAdminRepo.findOneByIdOrThrow(
    command.organizationAdminId,
    ['organizations'],
  )

  const changed = await found.changePassword(
    command.currentPassword,
    command.newPassword,
    configService.getSaltRound(),
  )

  if (changed.isErr) {
    return Result.err(changed.error)
  }

  const organizationAdmin = await organizationAdminRepo.save(found)

  return Result.ok(organizationAdmin.id.value)
}
