import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { UserRepositoryPort } from '../../../user/database/user/user.repository.port'
import { Name } from '../../../user/domain/value-objects/name.value-object'
import { OrganizationAdminRepositoryPort } from '../../database/organization-admin/organization-admin.repository.port'
import { OrganizationAdminNotFoundError } from '../../errors/organization-admin.errors'
import { UpdateOrganizationAdminCommand } from './update-organization-admin.command'

export async function updateOrganizationAdmin(
  command: UpdateOrganizationAdminCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<string, OrganizationAdminNotFoundError>> {
  const organizationAdminRepository: OrganizationAdminRepositoryPort =
    unitOfWork.getOrganizationAdminRepository(command.correlationId)
  const receiverRepo: ReceiverRepositoryPort = unitOfWork.getReceiverRepository(
    command.correlationId,
  )
  const userRepo: UserRepositoryPort = unitOfWork.getUserRepository(
    command.correlationId,
  )

  const organizationAdmin =
    await organizationAdminRepository.findOneByIdOrThrow(
      command.organizationAdminId,
    )

  const updateOrganizationAdminUser = async () => {
    if (command.firstname || command.lastname) {
      const user = await userRepo.findOneByIdOrThrow(
        organizationAdmin.userId.value,
      )
      user.name = new Name({
        firstname: command.firstname ? command.firstname : user.name.firstname,
        lastname: command.lastname ? command.lastname : user.name.lastname,
      })
      await userRepo.save(user)
    }
  }

  const updateOrganizationAdminReceiver = async () => {
    if (command.email) {
      const receiver = await receiverRepo.findOneByUserIdOrThrow(
        organizationAdmin.userId.value,
      )
      receiver.email = new Email(command.email)
      await receiverRepo.save(receiver)
    }
  }

  await Promise.all([
    updateOrganizationAdminUser(),
    updateOrganizationAdminReceiver(),
  ])

  return Result.ok(organizationAdmin.id.value)
}
