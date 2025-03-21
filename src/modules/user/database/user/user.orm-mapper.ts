import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { UserEntity, UserProps } from '../../domain/entities/user.entity'
import { Name } from '../../domain/value-objects/name.value-object'
import { UserOrmEntity } from './user.orm-entity'

export class UserOrmMapper extends OrmMapper<UserEntity, UserOrmEntity> {
  protected encryptedFields = ['firstname', 'lastname', 'ipAdresses'] as const
  protected toOrmProps(entity: UserEntity): OrmEntityProps<UserOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<UserOrmEntity> = {
      firstname: props.name.firstname,
      lastname: props.name.lastname,
      role: props.role,
      ipAdresses: [...props.ipAdresses],
    }
    return ormProps
  }

  protected toDomainProps(ormEntity: UserOrmEntity): EntityProps<UserProps> {
    const id = new UUID(ormEntity.id)
    const props: UserProps = {
      name: new Name({
        firstname: ormEntity.firstname,
        lastname: ormEntity.lastname,
      }),
      role: ormEntity.role,
      ipAdresses: new Set(ormEntity.ipAdresses),
    }
    return { id, props }
  }
}
