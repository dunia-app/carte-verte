/* eslint-disable new-cap */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigService } from '../../../../../infrastructure/config/config.service'
import { AggregateRoot } from '../../../domain/base-classes/aggregate-root.base'
import { CreateEntityProps } from '../../../domain/base-classes/entity.base'
import { DateVO } from '../../../domain/value-objects/date.value-object'
import { UUID } from '../../../domain/value-objects/uuid.value-object'
import { TypeormEntityBase } from './typeorm.entity.base'

export type OrmEntityProps<OrmEntity> = Omit<
  OrmEntity,
  'id' | 'createdAt' | 'updatedAt'
>

export interface EntityProps<EntityProps> {
  id: UUID
  props: EntityProps
}

export abstract class OrmMapper<
  Entity extends AggregateRoot<unknown>,
  OrmEntity,
> {
  constructor(
    private entityConstructor: new (props: CreateEntityProps<any>) => Entity,
    private ormEntityConstructor: new (props: any) => OrmEntity,
    protected readonly config: ConfigService,
  ) {}

  // We only encrypt string and string array
  protected abstract encryptedFields: readonly (keyof OrmEntityProps<OrmEntity>)[]

  protected abstract toDomainProps(ormEntity: OrmEntity): EntityProps<unknown>

  protected abstract toOrmProps(entity: Entity): OrmEntityProps<OrmEntity>

  toDomainEntity(ormEntity: OrmEntity): Entity {
    this.decryptFields(ormEntity)
    const { id, props } = this.toDomainProps(ormEntity)
    const ormEntityBase: TypeormEntityBase =
      ormEntity as unknown as TypeormEntityBase
    return new this.entityConstructor({
      id,
      props,
      createdAt: new DateVO(ormEntityBase.createdAt),
      updatedAt: new DateVO(ormEntityBase.updatedAt),
    })
  }

  toOrmEntity(entity: Entity): OrmEntity {
    const props = this.toOrmProps(entity)
    this.encryptFields(props)
    return new this.ormEntityConstructor({
      ...props,
      id: entity.id.value,
      createdAt: entity.createdAt.value,
      updatedAt: entity.updatedAt.value,
    })
  }

  // Deactivate for now cause it is causing too much lag
  decryptFields(ormEntity: OrmEntityProps<OrmEntity>) {
    // this.encryptedFields.map((field) => {
    //   const oldValue = ormEntity[field]
    //   if (isString(oldValue)) {
    //     ormEntity[field] = this.config.decrypt(oldValue) as typeof oldValue
    //   } else if (isStringArray(oldValue)) {
    //     ormEntity[field] = oldValue.map((item) =>
    //       this.config.decrypt(item),
    //     ) as typeof oldValue
    //   }
    // })
  }

  encryptFields(ormEntity: OrmEntityProps<OrmEntity>) {
    // this.encryptedFields.map((field) => {
    //   const oldValue = ormEntity[field]
    //   if (isString(oldValue)) {
    //     ormEntity[field] = this.config.encrypt(oldValue) as typeof oldValue
    //   } else if (isStringArray(oldValue)) {
    //     ormEntity[field] = oldValue.map((item) =>
    //       this.config.encrypt(item),
    //     ) as typeof oldValue
    //   }
    // })
  }
}
