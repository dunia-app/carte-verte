import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  ReceiverEntity,
  ReceiverProps,
} from '../../domain/entities/receiver.entity'
import { DeviceToken } from '../../domain/value-objects/device-token.value-object'
import { ReceiverOrmEntity } from './receiver.orm-entity'

export class ReceiverOrmMapper extends OrmMapper<
  ReceiverEntity,
  ReceiverOrmEntity
> {
  protected encryptedFields = ['deviceTokens'] as const
  protected toOrmProps(
    entity: ReceiverEntity,
  ): OrmEntityProps<ReceiverOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<ReceiverOrmEntity> = {
      userId: props.userId.value,
      email: props.email.value,
      acceptEmail: props.acceptEmail,
      acceptNotification: props.acceptNotification,
      deviceTokens: props.deviceTokens.map((it) => it.unpack()),
      phoneNumber: props.phoneNumber,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: ReceiverOrmEntity,
  ): EntityProps<ReceiverProps> {
    const id = new UUID(ormEntity.id)
    const props: ReceiverProps = {
      userId: new UUID(ormEntity.userId),
      email: new Email(ormEntity.email),
      acceptEmail: ormEntity.acceptEmail,
      acceptNotification: ormEntity.acceptNotification,
      deviceTokens: ormEntity.deviceTokens.map(
        (it) =>
          new DeviceToken({
            deviceId: it.deviceId,
            deviceTokens: it.deviceTokens,
          }),
      ),
      phoneNumber: ormEntity.phoneNumber,
    }
    return { id, props }
  }
}
