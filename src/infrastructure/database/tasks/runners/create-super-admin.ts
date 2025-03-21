import { hashSync } from 'bcrypt';
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object';
import { ReceiverOrmEntity } from '../../../../modules/message/database/receiver/receiver.orm-entity';
import { ReceiverRepository } from '../../../../modules/message/database/receiver/receiver.repository';
import { ReceiverEntity } from '../../../../modules/message/domain/entities/receiver.entity';
import { SuperAdminOrmEntity } from '../../../../modules/user/database/super-admin/super-admin.orm-entity';
import { SuperAdminRepository } from '../../../../modules/user/database/super-admin/super-admin.repository';
import { UserOrmEntity } from '../../../../modules/user/database/user/user.orm-entity';
import { UserRepository } from '../../../../modules/user/database/user/user.repository';
import { SuperAdminEntity } from '../../../../modules/user/domain/entities/super-admin.entity';
import { UserEntity } from '../../../../modules/user/domain/entities/user.entity';
import { UserRoles } from '../../../../modules/user/domain/entities/user.types';
import { Name } from '../../../../modules/user/domain/value-objects/name.value-object';
import { ConfigService } from '../../../config/config.service';
import { newConnection } from '../../create_connection';
import { superAdminInput } from '../../fixtures/demo_super_admin';
const cryptoRandomString = require('crypto-random-string');

export interface SuperAdminManualCreationInput {
  firstname: string
  lastname: string
  email: string
}

export default async function createSuperAdmin() {
  const config = new ConfigService()
  return newConnection().then(async (connection) => {
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

    const userProps: UserEntity = UserEntity.create({
      name: new Name({
        firstname: superAdminInput.firstname,
        lastname: superAdminInput.lastname,
      }),
      role: UserRoles.superAdmin,
    })

    const password = cryptoRandomString({ length: 15, type: 'alphanumeric' })

    const aggregate: {
      user: UserEntity
      receiver: ReceiverEntity
      superAdmin: SuperAdminEntity
    } = {
      user: userProps,
      receiver: ReceiverEntity.create({
        userId: userProps.id,
        email: new Email(superAdminInput.email),
      }),
      superAdmin: SuperAdminEntity.create({
        userId: userProps.id,
        password: hashSync(password, config.getSaltRound()),
      }),
    }
    if (await receiverRepo.exists(aggregate.receiver.email.value)) {
      console.log('user already exists')
      return
    }

    await userRepo.save(userProps)
    await Promise.all([
      await receiverRepo.save(aggregate.receiver),
      await superAdminRepo.save(aggregate.superAdmin),
    ])

    console.log('super admin successfully created')
    console.log(password)
    return connection.destroy()
  })
}
