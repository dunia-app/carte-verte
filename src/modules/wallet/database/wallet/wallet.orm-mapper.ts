import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  EntityProps,
  OrmEntityProps,
  OrmMapper,
} from '../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { WalletEntity, WalletProps } from '../../domain/entities/wallet.entity'
import { Balance } from '../../domain/value-objects/balance.value-object'
import { WalletOrmEntity } from './wallet.orm-entity'

export class WalletOrmMapper extends OrmMapper<WalletEntity, WalletOrmEntity> {
  protected encryptedFields = [] as const
  protected toOrmProps(entity: WalletEntity): OrmEntityProps<WalletOrmEntity> {
    const props = entity.getPropsCopy()

    const ormProps: OrmEntityProps<WalletOrmEntity> = {
      employeeId: props.employeeId.value,
      name: props.name,
      balance: props.balance.value,
      authorizedBalance: props.authorizedBalance.value,
      advantage: props.advantage,
    }
    return ormProps
  }

  protected toDomainProps(
    ormEntity: WalletOrmEntity,
  ): EntityProps<WalletProps> {
    const id = new UUID(ormEntity.id)
    const props: WalletProps = {
      employeeId: new UUID(ormEntity.employeeId),
      name: ormEntity.name,
      balance: new Balance(ormEntity.balance),
      authorizedBalance: new Balance(ormEntity.authorizedBalance),
      advantage: ormEntity.advantage,
    }
    return { id, props }
  }
}
