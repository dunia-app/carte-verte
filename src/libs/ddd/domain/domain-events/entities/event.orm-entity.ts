import { Column, Entity } from 'typeorm'
import { TWithStringKeys } from '../../../../types/t-with-keys'
import { OrmEntityProps } from '../../../infrastructure/database/base-classes/orm-mapper.base'
import { TypeormEntityBase } from '../../../infrastructure/database/base-classes/typeorm.entity.base'
import { UUID } from '../../value-objects/uuid.value-object'

@Entity('event')
export class EventOrmEntity extends TypeormEntityBase {
  constructor(props?: OrmEntityProps<EventOrmEntity>) {
    super(props)
    this.id = UUID.generate().value
    const now = new Date()
    this.createdAt = now
    this.updatedAt = now
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column({ type : 'varchar'})
  eventName!: string

  @Column({ type: 'jsonb' })
  variables!: TWithStringKeys
}
