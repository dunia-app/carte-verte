import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { UserOrmEntity } from '../user/user.orm-entity'

@Entity('super_admin')
export class SuperAdminOrmEntity extends TypeormEntityBase {
  constructor(props?: SuperAdminOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('uuid')
  userId!: string

  @Column('varchar')
  password!: string

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => UserOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  private _user!: never
}
