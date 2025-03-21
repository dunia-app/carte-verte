import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { WalletOrmEntity } from '../../database/wallet/wallet.orm-entity'
import { WalletRepository } from '../../database/wallet/wallet.repository'
import { Balance } from '../value-objects/balance.value-object'
import { WalletEntity, WalletProps } from './wallet.entity'

export interface WalletFactoryProps {
  employeeId: UUID
  advantage?: AdvantageType
  balance?: Balance
  authorizedBalance?: Balance
}

export class WalletFactory extends BaseFactory<
  WalletEntity,
  WalletFactoryProps,
  WalletRepository,
  WalletOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(WalletRepository)
  }

  protected buildEntity(defaultData: WalletFactoryProps) {
    const props: WalletProps = {
      name: 'test',
      advantage: AdvantageType.MEALTICKET,
      balance: new Balance(0),
      authorizedBalance: new Balance(0),
      ...defaultData,
    }
    return new WalletEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
