import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  NotificationEntity,
  NotificationProps,
} from '../../domain/entities/notification.entity'
import { NotificationResponseVO } from '../../domain/value-objects/notification-response.value-object'
import { NotificationOrmEntity } from './notification.orm-entity'

export class NotificationOrmMapper extends OrmMapper<
  NotificationEntity,
  NotificationOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: NotificationEntity,
  ): OrmEntityProps<NotificationOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<NotificationOrmEntity> = {
      messageId: props.messageId.value,
      type: props.type,
      willSendAt: props.willSendAt.value,
      title: props.title,
      content: props.content,
      sentAt: props.sentAt?.value,
      failedToSendAt: props.failedToSendAt?.value,
      receivedAt: props.receivedAt?.value,
      response: props.response?.unpack(),
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: NotificationOrmEntity,
  ): EntityProps<NotificationProps> {
    const id = new UUID(ormEntity.id)
    const props: NotificationProps = {
      messageId: new UUID(ormEntity.messageId),
      type: ormEntity.type,
      willSendAt: new DateVO(ormEntity.willSendAt),
      title: ormEntity.title ? ormEntity.title : undefined,
      content: ormEntity.content ? ormEntity.content : undefined,
      sentAt: ormEntity.sentAt ? new DateVO(ormEntity.sentAt) : undefined,
      failedToSendAt: ormEntity.failedToSendAt
        ? new DateVO(ormEntity.failedToSendAt)
        : undefined,
      receivedAt: ormEntity.receivedAt
        ? new DateVO(ormEntity.receivedAt)
        : undefined,
      response: ormEntity.response
        ? new NotificationResponseVO(ormEntity.response)
        : undefined,
    }
    return { id, props }
  }
}
