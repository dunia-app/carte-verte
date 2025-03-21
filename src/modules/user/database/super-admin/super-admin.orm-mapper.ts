import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  SuperAdminEntity,
  SuperAdminProps,
} from '../../domain/entities/super-admin.entity'
import { SuperAdminOrmEntity } from './super-admin.orm-entity'

export class SuperAdminOrmMapper extends OrmMapper<
  SuperAdminEntity,
  SuperAdminOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: SuperAdminEntity,
  ): OrmEntityProps<SuperAdminOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<SuperAdminOrmEntity> = {
      userId: props.userId.value,
      password: props.password,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: SuperAdminOrmEntity,
  ): EntityProps<SuperAdminProps> {
    const id = new UUID(ormEntity.id)
    const props: SuperAdminProps = {
      userId: new UUID(ormEntity.userId),
      password: ormEntity.password,
    }
    return { id, props }
  }
}
