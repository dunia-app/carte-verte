import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  CardAcquisitionEntity,
  CardAcquisitionProps,
} from '../../domain/entities/card-acquisition.entity'
import { CardAcquisitionToken } from '../../domain/value-objects/card-acquisition-token.value-object'
import { CardAcquisitionOrmEntity } from './card-acquisition.orm-entity'

export class CardAcquisitionOrmMapper extends OrmMapper<
  CardAcquisitionEntity,
  CardAcquisitionOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: CardAcquisitionEntity,
  ): OrmEntityProps<CardAcquisitionOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<CardAcquisitionOrmEntity> = {
      externalId: props.externalId,
      employeeId: props.employeeId,
      token: props.token.value,
      isActive: props.isActive,
      maskedPan: props.maskedPan,
      paymentProduct: props.paymentProduct,
      status: props.status,
      baasId: props.baasId,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: CardAcquisitionOrmEntity,
  ): EntityProps<CardAcquisitionProps> {
    const id = new UUID(ormEntity.id)
    const props: CardAcquisitionProps = {
      externalId: ormEntity.externalId,
      employeeId: ormEntity.employeeId,
      token: new CardAcquisitionToken({ value: ormEntity.token }),
      isActive: ormEntity.isActive,
      maskedPan: ormEntity.maskedPan,
      paymentProduct: ormEntity.paymentProduct,
      status: ormEntity.status,
      baasId: ormEntity.baasId,
    }
    return { id, props }
  }
}
