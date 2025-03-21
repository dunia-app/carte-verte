import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { ReceiverRepositoryPort } from '../../../message/database/receiver/receiver.repository.port'
import { ReceiverEntity } from '../../../message/domain/entities/receiver.entity'
import { UserRepositoryPort } from '../../../user/database/user/user.repository.port'
import { UserEntity } from '../../../user/domain/entities/user.entity'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { Name } from '../../../user/domain/value-objects/name.value-object'
import { OrganizationAdminEntity } from '../../domain/entities/organization-admin.entity'
import { OrganizationAdminAlreadyExistsError } from '../../errors/organization-admin.errors'

interface CreateOrganizationAdminParams {
  correlationId: string
  email: string
  firstname: string
  lastname: string
  organizationId: string
  sendCreationEvent?: boolean
}

export async function createOrganizationAdmin(
  unitOfWork: UnitOfWork,
  params: CreateOrganizationAdminParams,
): Promise<Result<string, OrganizationAdminAlreadyExistsError>> {
  /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
  const userRepo: UserRepositoryPort = unitOfWork.getUserRepository(
    params.correlationId,
  )

  const receiverRepo: ReceiverRepositoryPort = unitOfWork.getReceiverRepository(
    params.correlationId,
  )

  const organizationAdminRepo = unitOfWork.getOrganizationAdminRepository(
    params.correlationId,
  )

  const existingReceiver = await receiverRepo.findOneByEmail(params.email)

  if (existingReceiver) {
    const existingOrganizationAdmin = await organizationAdminRepo.exists(
      existingReceiver.userId.value,
    )
    const existingOrganizationAdminInOrganization =
      await organizationAdminRepo.existsInOrganization(
        existingReceiver.userId.value,
        params.organizationId,
      )

    if (existingOrganizationAdmin && existingOrganizationAdminInOrganization) {
      return Result.err(new OrganizationAdminAlreadyExistsError())
    }

    if (existingOrganizationAdmin && !existingOrganizationAdminInOrganization) {
      const organizationAdmin =
        await organizationAdminRepo.findOneByUserIdOrThrow(
          existingReceiver.userId.value,
        )
      organizationAdmin.addOrganization(new UUID(params.organizationId))
      const updatedOrganizationAdmin = await organizationAdminRepo.save(
        organizationAdmin,
      )
      return Result.ok(updatedOrganizationAdmin.id.value)
    }
  }

  const user = UserEntity.create({
    name: new Name({
      firstname: params.firstname,
      lastname: params.lastname,
    }),
    role: UserRoles.organizationAdmin,
  })

  const receiver = ReceiverEntity.create({
    userId: user.id,
    email: new Email(params.email),
  })

  const organizationAdmin = OrganizationAdminEntity.create(
    {
      organizationsIds: [new UUID(params.organizationId)],
      userId: isUndefined(existingReceiver) ? user.id : existingReceiver.userId,
    },
    params.sendCreationEvent,
  )

  const [_userCreated, _receiverCreated, organizationAdminCreated] =
    await Promise.all([
      isUndefined(existingReceiver) ? userRepo.save(user) : null,
      isUndefined(existingReceiver) ? receiverRepo.save(receiver) : null,
      organizationAdminRepo.save(organizationAdmin),
    ])
  return Result.ok(organizationAdminCreated.id.value)
}
