import { Address } from '../../../libs/ddd/domain/value-objects/address.value-object'
import { Email } from '../../../libs/ddd/domain/value-objects/email.value-object'
import { OrganizationName } from '../../../libs/ddd/domain/value-objects/name.value-object'
import { ReceiverOrmEntity } from '../../../modules/message/database/receiver/receiver.orm-entity'
import { ReceiverRepository } from '../../../modules/message/database/receiver/receiver.repository'
import { ReceiverEntity } from '../../../modules/message/domain/entities/receiver.entity'
import { OrganizationAdminOrmEntity } from '../../../modules/organization/database/organization-admin/organization-admin.orm-entity'
import { OrganizationAdminRepository } from '../../../modules/organization/database/organization-admin/organization-admin.repository'
import { OrganizationOrmEntity } from '../../../modules/organization/database/organization/organization.orm-entity'
import { OrganizationRepository } from '../../../modules/organization/database/organization/organization.repository'
import { OrganizationAdminEntity } from '../../../modules/organization/domain/entities/organization-admin.entity'
import { OrganizationEntity } from '../../../modules/organization/domain/entities/organization.entity'
import {
  CommissionType,
  OrganizationOffer,
} from '../../../modules/organization/domain/value-objects/organization-offer.value-object'
import { OrganizationSettings } from '../../../modules/organization/domain/value-objects/organization-settings.value-object'
import { UserOrmEntity } from '../../../modules/user/database/user/user.orm-entity'
import { UserRepository } from '../../../modules/user/database/user/user.repository'
import { UserEntity } from '../../../modules/user/domain/entities/user.entity'
import { UserRoles } from '../../../modules/user/domain/entities/user.types'
import { Name } from '../../../modules/user/domain/value-objects/name.value-object'
import { OrganizationDefautWalletSettingsOrmEntity } from '../../../modules/wallet/database/organization-defaut-wallet-settings/organization-defaut-wallet-settings.orm-entity'
import { OrganizationDefautWalletSettingsRepository } from '../../../modules/wallet/database/organization-defaut-wallet-settings/organization-defaut-wallet-settings.repository'
import { OrganizationDefautWalletSettingsEntity } from '../../../modules/wallet/domain/entities/organization-defaut-wallet-settings.entity'
import { ConfigService } from '../../config/config.service'
import { newConnection } from '../create_connection'

const testOrganizationName = 'Dunia Test'

export async function organizationsFixtures() {
  const config = new ConfigService()
  const connection = await newConnection({ logging: false })
  const receiverRepo = new ReceiverRepository(
    connection.getRepository(ReceiverOrmEntity),
    config,
  )
  const userRepo = new UserRepository(
    connection.getRepository(UserOrmEntity),
    config,
  )
  const organizationAdminRepo = new OrganizationAdminRepository(
    connection.getRepository(OrganizationAdminOrmEntity),
    config,
  )
  const organizationRepo = new OrganizationRepository(
    connection.getRepository(OrganizationOrmEntity),
    config,
  )
  const organizationDefaultWalletSettingsRepo =
    new OrganizationDefautWalletSettingsRepository(
      connection.getRepository(OrganizationDefautWalletSettingsOrmEntity),
      config,
    )
  const organizationFound = await organizationRepo.exists(testOrganizationName)
  if (organizationFound) return

  // build organizations

  const organizationProps: OrganizationEntity = OrganizationEntity.create({
    address: new Address({
      city: 'Lille',
      postalCode: '59000',
      street: '18 rue de Euratech',
    }),
    name: new OrganizationName(testOrganizationName),
    offer: new OrganizationOffer({
      commission: 5,
      commissionType: CommissionType.PERCENT,
      advantageInShops: 5,
      physicalCardPrice: 0,
      firstPhysicalCardPrice: 0,
    }),
    settings: new OrganizationSettings({
      coveragePercent: 50,
      mealTicketAmount: 11.38,
      mealTicketDay: 1,
      mealTicketAutoRenew: false,
      physicalCardCoverage: 0,
      firstPhysicalCardCoverage: 0,
    }),
    siret: '88815014100016',
  })
  organizationProps.acceptOffer()

  const organizationDefaultWalletSettings: OrganizationDefautWalletSettingsEntity =
    OrganizationDefautWalletSettingsEntity.create({
      name: 'default',
      organizationId: organizationProps.id,
    })

  const userProps: UserEntity[] = [
    UserEntity.create({
      name: new Name({
        firstname: 'buniadmin',
        lastname: 'admin',
      }),
      role: UserRoles.organizationAdmin,
    }),
    UserEntity.create({
      name: new Name({
        firstname: 'juniadmin',
        lastname: 'admin',
      }),
      role: UserRoles.organizationAdmin,
    }),
  ]
  const aggregateUserProps: {
    user: UserEntity
    receiver: ReceiverEntity
    organizationAdmin: OrganizationAdminEntity
  }[] = [
    {
      user: userProps[0],
      receiver: ReceiverEntity.create({
        userId: userProps[0].id,
        email: new Email('benjamin@dunia-test.app'),
      }),
      organizationAdmin: OrganizationAdminEntity.create({
        userId: userProps[0].id,
        organizationsIds: [organizationProps.id],
      }),
    },
    {
      user: userProps[1],
      receiver: ReceiverEntity.create({
        userId: userProps[1].id,
        email: new Email('julien@dunia-test.app'),
      }),
      organizationAdmin: OrganizationAdminEntity.create({
        userId: userProps[1].id,
        organizationsIds: [organizationProps.id],
      }),
    },
  ]

  const userToSave: UserEntity[] = []
  const receiverToSave: ReceiverEntity[] = []
  const organizationAdminToSave: OrganizationAdminEntity[] = []
  for (const aggregate of aggregateUserProps) {
    const userFound = await receiverRepo.exists(aggregate.receiver.email.value)
    if (userFound) return

    userToSave.push(aggregate.user)
    receiverToSave.push(aggregate.receiver)
    organizationAdminToSave.push(aggregate.organizationAdmin)
  }

  console.log('organization fixtures pushing')
  console.time(`saving 1 organization`)
  await Promise.all([
    organizationRepo.save(organizationProps),
    userToSave.length > 0 ? userRepo.saveMultiple(userToSave) : [],
  ])
  await Promise.all([
    organizationDefaultWalletSettingsRepo.save(
      organizationDefaultWalletSettings,
    ),
    receiverToSave.length > 0 ? receiverRepo.saveMultiple(receiverToSave) : [],
    organizationAdminToSave.length > 0
      ? organizationAdminRepo.saveMultiple(organizationAdminToSave)
      : [],
  ])
  console.timeEnd(`saving 1 organization`)
  connection.destroy()
}
