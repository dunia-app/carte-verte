import bcrypt from 'bcrypt'
import { Email } from '../../../libs/ddd/domain/value-objects/email.value-object'
import { ReceiverOrmEntity } from '../../../modules/message/database/receiver/receiver.orm-entity'
import { ReceiverRepository } from '../../../modules/message/database/receiver/receiver.repository'
import { ReceiverEntity } from '../../../modules/message/domain/entities/receiver.entity'
import { SuperAdminOrmEntity } from '../../../modules/user/database/super-admin/super-admin.orm-entity'
import { SuperAdminRepository } from '../../../modules/user/database/super-admin/super-admin.repository'
import { UserOrmEntity } from '../../../modules/user/database/user/user.orm-entity'
import { UserRepository } from '../../../modules/user/database/user/user.repository'
import { SuperAdminEntity } from '../../../modules/user/domain/entities/super-admin.entity'
import { UserEntity } from '../../../modules/user/domain/entities/user.entity'
import { UserRoles } from '../../../modules/user/domain/entities/user.types'
import { Name } from '../../../modules/user/domain/value-objects/name.value-object'
import { ConfigService } from '../../config/config.service'
import { newConnection } from '../create_connection'

export async function usersFixtures() {
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
  const superAdminRepo = new SuperAdminRepository(
    connection.getRepository(SuperAdminOrmEntity),
    config,
  )

  // build admins

  const { ADMIN_PWD, ADMIN_FIRST_PWD, DEMO_PWD, DEMO_TEL } = process.env
  const userProps: UserEntity[] = [
    UserEntity.create({
      name: new Name({
        firstname: 'benjadmin',
        lastname: 'superAdmin',
      }),
      role: UserRoles.superAdmin,
    }),
    UserEntity.create({
      name: new Name({
        firstname: 'juadmin',
        lastname: 'superAdmin',
      }),
      role: UserRoles.superAdmin,
    }),
  ]
  const aggregateUserProps: {
    user: UserEntity
    receiver: ReceiverEntity
    superAdmin: SuperAdminEntity
  }[] = [
    {
      user: userProps[0],
      receiver: ReceiverEntity.create({
        userId: userProps[0].id,
        email: new Email('benjamin@dunia.app'),
      }),
      superAdmin: SuperAdminEntity.create({
        userId: userProps[0].id,
        password: bcrypt.hashSync(ADMIN_PWD!, config.getSaltRound()),
      }),
    },
    {
      user: userProps[1],
      receiver: ReceiverEntity.create({
        userId: userProps[1].id,
        email: new Email('julien@dunia.app'),
      }),
      superAdmin: SuperAdminEntity.create({
        userId: userProps[1].id,
        password: bcrypt.hashSync(ADMIN_FIRST_PWD!, config.getSaltRound()),
      }),
    },
  ]

  const userToSave: UserEntity[] = []
  const receiverToSave: ReceiverEntity[] = []
  const superAdminToSave: SuperAdminEntity[] = []
  for (const aggregate of aggregateUserProps) {
    const userFound = await receiverRepo.exists(aggregate.receiver.email.value)
    if (userFound) return

    userToSave.push(aggregate.user)
    receiverToSave.push(aggregate.receiver)
    superAdminToSave.push(aggregate.superAdmin)
  }

  console.log('users fixtures pushing')
  console.time(`saving ${userToSave.length} users`)
  await userRepo.saveMultiple(userToSave)
  await Promise.all([
    await receiverRepo.saveMultiple(receiverToSave),
    await superAdminRepo.saveMultiple(superAdminToSave),
  ])
  console.timeEnd(`saving ${userToSave.length} users`)
  connection.destroy()
}
