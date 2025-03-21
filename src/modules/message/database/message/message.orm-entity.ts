import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm'
import { TypeormEntityBase } from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.entity.base'
import { MessageTemplateName } from '../../domain/entities/template.types'
import { MessageTemplateNameEnumOrmEntity } from '../message-template-name-enum/message-template-name-enum.orm-entity'
import { NotificationOrmEntity } from '../notification/notification.orm-entity'
import { ReceiverOrmEntity } from '../receiver/receiver.orm-entity'

/**
 * @module MessageOrmEntity
 * This module exports the `MessageOrmEntity` class, which maps the `MessageEntity` domain entity to a `message` table in the database.
 */

/**
 * Class that maps the `MessageEntity` domain entity to a `message` table in the database.
 * This class extends `TypeormEntityBase`, which includes basic columns like `id`, `createdAt`, and `updatedAt`.
 */
@Entity('message')
export class MessageOrmEntity extends TypeormEntityBase {
  /**
   * Creates a new `MessageOrmEntity`.
   * 
   * @param props - The properties of the `MessageOrmEntity`.
   */
  constructor(props?: MessageOrmEntity) {
    super(props)
  }

  /**
   * The ID of the receiver of the message.
   */
  @Column('uuid')
  receiverId!: string

  /**
   * The name of the template of the message.
   */
  @Column('varchar')
  templateName!: MessageTemplateName

  /**
   * The variables of the message.
   */
  @Column({ type: 'jsonb' })
  variables: any

  /**
   * The notifications of the message.
   * This is a one-to-many relationship with the `NotificationOrmEntity`.
   */
  @OneToMany(
    () => NotificationOrmEntity,
    (NotificationOrmEntity) => NotificationOrmEntity.messageId,
    {
      onDelete: 'CASCADE',
      nullable: true,
    },
  )
  notifications?: NotificationOrmEntity[]

  /**
   * Indicates whether the receiver can skip consent for the message.
   */
  @Column({ type: 'boolean', default: false })
  skipReceiverConsent!: boolean

  /**
   * The path to the file associated with the message.
   */
  @Column("text", { nullable: true, array: true})
  filesPaths?: string[]

  // Foreign keys
  // We need to set them as private and never so that we do not get them in orm mapper

  /**
   * The receiver of the message.
   * This is a many-to-one relationship with the `ReceiverOrmEntity`.
   * @private
   */
  @ManyToOne(() => ReceiverOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiverId' })
  private _receiver!: never

  /**
   * The template name enum of the message.
   * This is a many-to-one relationship with the `MessageTemplateNameEnumOrmEntity`.
   * @private
   */
  @ManyToOne(() => MessageTemplateNameEnumOrmEntity, {
    nullable: false,
    persistence: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'templateName', referencedColumnName: 'value' })
  private _templateNameEnum!: never
}
