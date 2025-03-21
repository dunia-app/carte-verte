import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { CardAcquisitionPayinOrmEntity } from '../../database/card-acquisition-payin/card-acquisition-payin.orm-entity'
import { CardAcquisitionPayinRepository } from '../../database/card-acquisition-payin/card-acquisition-payin.repository'
import {
  CardAcquisitionPayinEntity,
  CardAcquisitionPayinProps,
} from './card-acquisition-payin.entity'
import { CardAcquisitionPayinStatus } from './card-acquisition-payin.types'

export interface CardAcquisitionPayinFactoryProps {
  employeeId: string
  externalCardAcquisitionId?: string
  amount?: number
  reference?: string
  status?: CardAcquisitionPayinStatus
  transactionExternalPaymentId?: string
}

export class CardAcquisitionPayinFactory extends BaseFactory<
  CardAcquisitionPayinEntity,
  CardAcquisitionPayinFactoryProps,
  CardAcquisitionPayinRepository,
  CardAcquisitionPayinOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(CardAcquisitionPayinRepository)
  }

  protected buildEntity(defaultData: CardAcquisitionPayinFactoryProps) {
    const props: CardAcquisitionPayinProps = {
      externalAuthorizationId: faker.string.uuid(),
      reference: faker.string.numeric(12),
      status: CardAcquisitionPayinStatus.Authorized,
      amount: 0,
      ...defaultData,
    }
    return new CardAcquisitionPayinEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
