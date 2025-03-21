import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Address } from '../../../../libs/ddd/domain/value-objects/address.value-object'
import { OrganizationName } from '../../../../libs/ddd/domain/value-objects/name.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { OrganizationAdminRepositoryPort } from '../../database/organization-admin/organization-admin.repository.port'
import { OrganizationRepositoryPort } from '../../database/organization/organization.repository.port'
import { OrganizationAdminLoginResp } from '../../dtos/organization-admin.response.dto'
import {
  OrganizationAdminNotActivatedError,
  OrganizationAdminPasswordFormatNotCorrectError,
  OrganizationIdIsMissingError,
} from '../../errors/organization-admin.errors'
import { RegisterOrganizationAdminCommand } from './register-organization-admin.command'

export async function registerOrganizationAdmin(
  command: RegisterOrganizationAdminCommand,
  unitOfWork: UnitOfWork,
  configService: ConfigService,
): Promise<
  Result<
    OrganizationAdminLoginResp,
    | OrganizationAdminPasswordFormatNotCorrectError
    | OrganizationAdminNotActivatedError
  >
> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */

  const receiverRepo: ReceiverRepositoryPort = unitOfWork.getReceiverRepository(
    command.correlationId,
  )
  const organizationRepo: OrganizationRepositoryPort =
    unitOfWork.getOrganizationRepository(command.correlationId)
  const organizationAdminRepo: OrganizationAdminRepositoryPort =
    unitOfWork.getOrganizationAdminRepository(command.correlationId)

  const receiver = await receiverRepo.findOneByEmailOrThrow(command.email)
  const organizationAdmin = await organizationAdminRepo.findOneByUserIdOrThrow(
    receiver.userId.value,
  )
  if (
    !organizationAdmin.isOrganizationAccessible(
      new UUID(command.organizationId),
    )
  ) {
    return Result.err(new OrganizationIdIsMissingError())
  }

  const organization = await organizationRepo.findOneByIdOrThrow(
    command.organizationId,
  )

  // SetPassword
  const refreshToken = await organizationAdmin.setPassword(
    command.password,
    configService.getSaltRound(),
  )
  if (refreshToken.isErr) {
    return Result.err(refreshToken.error)
  }
  // AcceptOffer
  organization.acceptOffer()
  organization.setSiret(
    command.siret,
    new OrganizationName(command.name!),
    new Address(command.address!),
  )

  await organizationRepo.save(organization)
  await organizationAdminRepo.save(organizationAdmin)

  return Result.ok({
    organizationAdminId: organizationAdmin.id,
    refreshToken: refreshToken.unwrap(),
  })
}
