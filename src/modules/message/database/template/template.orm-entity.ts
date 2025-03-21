import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import {
  NotificationType,
  notificationTypeEnumName,
} from '../../domain/entities/notification.types'
import { MessageTemplateName } from '../../domain/entities/template.types'
import { MessageTemplateNameEnumOrmEntity } from '../message-template-name-enum/message-template-name-enum.orm-entity'

@Entity('template')
export class TemplateOrmEntity extends TypeormEntityBase {
  constructor(props?: TemplateOrmEntity) {
    super(props)
  }

  @Column('varchar')
  templateName!: MessageTemplateName

  @Column({
    type: 'enum',
    array: true,
    enum: NotificationType,
    enumName: notificationTypeEnumName,
  })
  allowedNotificationType!: NotificationType[]

  @Column({ type: 'varchar', nullable: true })
  title?: string

  @Column('varchar')
  content!: string

  @Column({ type: 'varchar', nullable: true })
  iconUrl?: string

  @Column({ type: 'varchar', nullable: true })
  link?: string

  @Column({ type: 'boolean', default: false })
  unsubscribable!: boolean

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper
  @ManyToOne(() => MessageTemplateNameEnumOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'templateName', referencedColumnName: 'value' })
  private _templateNameEnum!: never
}
