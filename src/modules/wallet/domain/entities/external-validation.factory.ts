import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { MCC } from '../../../merchant/domain/value-objects/mcc.value-object'
import { ExternalValidationOrmEntity } from '../../database/external-validation/external-validation.orm-entity'
import { ExternalValidationRepository } from '../../database/external-validation/external-validation.repository'
import {
  ExternalValidationEntity,
  ExternalValidationProps,
} from './external-validation.entity'
import { ExternalValidationResponseCode } from './external-validation.types'

export interface ExternalValidationFactoryProps {
  authorizationIssuerId?: string
  cardPublicToken?: string
  paymentAmount?: number
  responseCode?: ExternalValidationResponseCode
}

export class ExternalValidationFactory extends BaseFactory<
  ExternalValidationEntity,
  ExternalValidationFactoryProps,
  ExternalValidationRepository,
  ExternalValidationOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(ExternalValidationRepository)
  }

  protected buildEntity(defaultData: ExternalValidationFactoryProps) {
    const props: ExternalValidationProps = {
      authorizationIssuerId: 'test',
      cardPublicToken: 'test',
      mcc: new MCC('1020'),
      merchantName: 'test',
      mid: 'test',
      paymentAmount: faker.number.float({ max: -0.01, min: -19 }),
      paymentDate: new Date(),
      responseCode: ExternalValidationResponseCode.AUTHORIZED,
      ...defaultData,
    }
    return new ExternalValidationEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
