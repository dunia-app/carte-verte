import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  MessageEntity,
  MessageProps,
} from '../../domain/entities/message.entity'
import { NotificationEntity } from '../../domain/entities/notification.entity'
import { NotificationOrmEntity } from '../notification/notification.orm-entity'
import { NotificationOrmMapper } from '../notification/notification.orm-mapper'
import { MessageOrmEntity } from './message.orm-entity'

/**
 * @module MessageOrmMapper
 * This module exports the `MessageOrmMapper` class, which maps the `MessageEntity` domain entity to the `MessageOrmEntity` ORM entity.
 */

/**
 * Class that maps the `MessageEntity` domain entity to the `MessageOrmEntity` ORM entity.
 * This class extends `O`rmMapper`, which is a base class for all ORM mappers.
 */
export class MessageOrmMapper extends OrmMapper<
  MessageEntity,
  MessageOrmEntity
> {
  /**
   * An array of the fields of the `MessageOrmEntity` that are encrypted.
   */
  protected encryptedFields = [] as const

  /**
   * An instance of `NotificationOrmMapper` that is used to map `NotificationEntity` domain entities to `NotificationOrmEntity` ORM entities.
   */
  notificationMapper: OrmMapper<NotificationEntity, NotificationOrmEntity> =
    new NotificationOrmMapper(
      NotificationEntity,
      NotificationOrmEntity,
      this.config,
    )

  /**
   * Maps the properties of a `MessageEntity` to the properties of a `MessageOrmEntity`.
   * 
   * @param entity - The `MessageEntity` to map.
   * @returns The properties of a `MessageOrmEntity`.
   */
  protected toOrmProps(
    entity: MessageEntity,
  ): OrmEntityProps<MessageOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<MessageOrmEntity> = {
      receiverId: props.receiverId.value,
      templateName: props.templateName,
      variables: props.variables,
      skipReceiverConsent: props.skipReceiverConsent,
      notifications: !isUndefined(props.notifications)
        ? props.notifications.map((notification) => {
            return this.notificationMapper.toOrmEntity(notification)
          })
        : undefined,
      filesPaths: props.filesPaths ?? [],
    }
    return ormProps
  }

  /**
   * Maps the properties of a `MessageOrmEntity` to the properties of a `MessageEntity`.
   * 
   * @param ormEntity - The `MessageOrmEntity` to map.
   * @returns The properties of a `MessageEntity`.
   */
  protected toDomainProps(
    ormEntity: MessageOrmEntity,
  ): EntityProps<MessageProps> {
    const id = new UUID(ormEntity.id)
    const props: MessageProps = {
      receiverId: new UUID(ormEntity.receiverId),
      templateName: ormEntity.templateName,
      variables: ormEntity.variables,
      skipReceiverConsent: ormEntity.skipReceiverConsent,
      notifications: undefined,
      filesPaths: ormEntity.filesPaths ?? [],
    }
    return { id, props }
  }
}
