import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  CardPaymentEntity,
  CardPaymentProps,
} from '../../domain/entities/card-payment.entity'
import { CardPaymentOrmEntity } from './card-payment.orm-entity'

export class CardPaymentOrmMapper extends OrmMapper<
  CardPaymentEntity,
  CardPaymentOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: CardPaymentEntity,
  ): OrmEntityProps<CardPaymentOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<CardPaymentOrmEntity> = {
      cardId: props.cardId.value,
      externalPaymentId: props.externalPaymentId,
      price: props.price,
      status: props.status,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: CardPaymentOrmEntity,
  ): EntityProps<CardPaymentProps> {
    const id = new UUID(ormEntity.id)
    const props: CardPaymentProps = {
      cardId: new UUID(ormEntity.cardId),
      externalPaymentId: ormEntity.externalPaymentId,
      price: ormEntity.price,
      status: ormEntity.status,
    }
    return { id, props }
  }
}
