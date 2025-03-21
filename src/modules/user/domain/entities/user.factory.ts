import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { UserOrmEntity } from '../../database/user/user.orm-entity'
import { UserRepository } from '../../database/user/user.repository'
import { Name } from '../value-objects/name.value-object'
import { CreateUserProps, UserEntity, UserProps } from './user.entity'
import { UserRoles } from './user.types'

export class UserFactory extends BaseFactory<
  UserEntity,
  Partial<CreateUserProps>,
  UserRepository,
  UserOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(UserRepository)
  }

  protected buildEntity(defaultData: Partial<CreateUserProps>) {
    const props: UserProps = {
      name: new Name({
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
      }),
      role: UserRoles.employee,
      ipAdresses: new Set(),
      ...defaultData,
    }
    return new UserEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
