import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  CardAcquisitionPayinEntity,
  CardAcquisitionPayinProps,
} from '../../domain/entities/card-acquisition-payin.entity'
import { CardAcquisitionPayinOrmEntity } from './card-acquisition-payin.orm-entity'

export class CardAcquisitionPayinOrmMapper extends OrmMapper<
  CardAcquisitionPayinEntity,
  CardAcquisitionPayinOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: CardAcquisitionPayinEntity,
  ): OrmEntityProps<CardAcquisitionPayinOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<CardAcquisitionPayinOrmEntity> = {
      externalAuthorizationId: props.externalAuthorizationId,
      employeeId: props.employeeId,
      amount: props.amount,
      externalCardAcquisitionId: props.externalCardAcquisitionId,
      reference: props.reference,
      status: props.status,
      transactionExternalPaymentId: props.transactionExternalPaymentId,
      externalPayinId: props.externalPayinId,
      amountCaptured: props.amountCaptured,
      errorCode: props.errorCode,
      errorMessage: props.errorMessage,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: CardAcquisitionPayinOrmEntity,
  ): EntityProps<CardAcquisitionPayinProps> {
    const id = new UUID(ormEntity.id)
    const props: CardAcquisitionPayinProps = {
      externalAuthorizationId: ormEntity.externalAuthorizationId,
      employeeId: ormEntity.employeeId,
      amount: ormEntity.amount,
      externalCardAcquisitionId: ormEntity.externalCardAcquisitionId,
      reference: ormEntity.reference,
      status: ormEntity.status,
      transactionExternalPaymentId: ormEntity.transactionExternalPaymentId,
      externalPayinId: ormEntity.externalPayinId,
      amountCaptured: ormEntity.amountCaptured,
      errorCode: ormEntity.errorCode,
      errorMessage: ormEntity.errorMessage,
    }
    return { id, props }
  }
}
