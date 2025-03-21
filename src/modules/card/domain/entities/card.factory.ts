import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { CardOrmEntity } from '../../database/card/card.orm-entity'
import { CardRepository } from '../../database/card/card.repository'
import { CardDigitalization } from '../value-objects/card-digitalization.value-object'
import { CardEntity, CardProps } from './card.entity'
import { CardDesign, LockStatus } from './card.types'

export interface CardFactoryProps {
  employeeId: UUID
  lockStatus?: LockStatus
  activatedAt?: DateVO
  convertedToPhysicalAt?: DateVO
  blockedAt?: DateVO
  isPinSet?: boolean
  cardDigitalizations?: CardDigitalization[]
  requestedToConvertToPhysicalAt?: DateVO
  physicalCardPriceToCover?: number
}

export class CardFactory extends BaseFactory<
  CardEntity,
  CardFactoryProps,
  CardRepository,
  CardOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(CardRepository)
  }

  protected buildEntity(defaultData: CardFactoryProps) {
    const props: CardProps = {
      externalId: faker.string.numeric(9),
      publicToken: faker.string.numeric(9),
      lockStatus: LockStatus.UNLOCK,
      physicalCardPriceToCover: 0,
      isPinSet: false,
      cardDigitalizations: [],
      embossedName: faker.person.firstName().toUpperCase(),
      suffix: faker.string.numeric(4),
      pinTryExceeded: false,
      design: CardDesign.GREEN,
      ...defaultData,
    }
    return new CardEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}