import { Column, Entity } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { UserRoles, userRolesEnumName } from '../../domain/entities/user.types'

@Entity('user')
export class UserOrmEntity extends TypeormEntityBase {
  constructor(props?: UserOrmEntity) {
    super(props)
  }

  @Column('varchar')
  firstname!: string

  @Column('varchar')
  lastname!: string

  @Column({
    type: 'enum',
    enum: UserRoles,
    enumName: userRolesEnumName,
  })
  role!: UserRoles

  @Column({ type: 'text', array: true, default: [] })
  ipAdresses!: string[]
}
