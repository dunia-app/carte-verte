import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import {
  NotificationType,
  notificationTypeEnumName,
} from '../../domain/entities/notification.types'
import { NotificationResponseProps } from '../../domain/value-objects/notification-response.value-object'
import { MessageOrmEntity } from '../message/message.orm-entity'

@Entity('notification')
export class NotificationOrmEntity extends TypeormEntityBase {
  constructor(props?: NotificationOrmEntity) {
    super(props)
  }
  // TO DO: still property to fill (isNullable, etc)
  @Column('uuid')
  messageId!: string

  @Column({
    type: 'enum',
    enum: NotificationType,
    enumName: notificationTypeEnumName,
  })
  type!: NotificationType

  @Column({ type: 'timestamptz' })
  willSendAt!: Date

  @Column({ type: 'varchar', nullable: true })
  title?: string

  @Column({ type: 'varchar', nullable: true })
  content?: string

  @Column({ nullable: true, type: 'timestamptz' })
  sentAt?: Date

  @Column({ nullable: true, type: 'timestamptz' })
  failedToSendAt?: Date

  @Column({ nullable: true, type: 'timestamptz' })
  receivedAt?: Date

  @Column({ nullable: true, type: 'jsonb' })
  response?: NotificationResponseProps

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => MessageOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'messageId' })
  private _message!: never
}
