import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { TransferOrmEntity } from '../../database/transfer/transfer.orm-entity'
import { TransferRepository } from '../../database/transfer/transfer.repository'
import { TransferEntity, TransferProps } from './transfer.entity'
import { TransferDirection, TransferSource } from './transfer.types'

interface TransferFactoryProps {
  walletId: UUID
  paymentDate?: DateVO
}

export class TransferFactory extends BaseFactory<
  TransferEntity,
  TransferFactoryProps,
  TransferRepository,
  TransferOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(TransferRepository)
  }

  protected buildEntity(defaultData: TransferFactoryProps) {
    const props: TransferProps = {
      source: faker.datatype.boolean()
        ? TransferSource.CASHBACK
        : TransferSource.MEAL_TICKET_CREDIT,
      name: faker.lorem.sentence(),
      paymentDate: new DateVO(new Date()),
      amount: faker.number.float({ min: 0.01, max: 100 }),
      direction: TransferDirection.CREDIT,
      ...defaultData,
    }
    return new TransferEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
