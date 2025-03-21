import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { UserOrmEntity } from '../../../user/database/user/user.orm-entity'
import { DeviceTokenProps } from '../../domain/value-objects/device-token.value-object'

@Entity('receiver')
@Unique('UQ_receiver_email', ['email'])
export class ReceiverOrmEntity extends TypeormEntityBase {
  constructor(props?: ReceiverOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('uuid')
  userId!: string

  @Column('varchar')
  email!: string

  @Column('boolean')
  acceptEmail!: boolean

  @Column('boolean')
  acceptNotification!: boolean

  @Column({ type: 'jsonb', default: () => "'[]'" })
  deviceTokens!: DeviceTokenProps[]

  @Column({ type: 'varchar', nullable: true })
  phoneNumber?: string

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
