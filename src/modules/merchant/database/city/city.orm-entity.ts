import { Column, Entity } from 'typeorm'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { OrmEntityProps } from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'

@Entity('city')
export class CityOrmEntity extends TypeormEntityBase {
  constructor(props?: OrmEntityProps<CityOrmEntity>) {
    super(props)
    this.id = UUID.generate().value
    const now = new Date()
    this.createdAt = now
    this.updatedAt = now
  }

  @Column('varchar')
  name!: string

  @Column({ type: 'double precision' })
  latitude!: number

  @Column({ type: 'double precision' })
  longitude!: number
}
