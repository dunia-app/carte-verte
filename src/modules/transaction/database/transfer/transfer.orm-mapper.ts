import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import {
  TransferEntity,
  TransferProps,
} from '../../domain/entities/transfer.entity'
import { TransferOrmEntity } from './transfer.orm-entity'

export class TransferOrmMapper extends OrmMapper<
  TransferEntity,
  TransferOrmEntity
> {
  protected encryptedFields = [] as const
  protected toOrmProps(
    entity: TransferEntity,
  ): OrmEntityProps<TransferOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<TransferOrmEntity> = {
      walletId: props.walletId?.value,
      source: props.source,
      name: props.name,
      paymentDate: props.paymentDate.value,
      amount: props.amount,
      direction: props.direction,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: TransferOrmEntity,
  ): EntityProps<TransferProps> {
    const id = new UUID(ormEntity.id)
    const props: TransferProps = {
      walletId: ormEntity.walletId ? new UUID(ormEntity.walletId) : undefined,
      source: ormEntity.source,
      name: ormEntity.name,
      paymentDate: new DateVO(ormEntity.paymentDate),
      amount: Number(ormEntity.amount),
      direction: ormEntity.direction,
    }
    return { id, props }
  }
}
