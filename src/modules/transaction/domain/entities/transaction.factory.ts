import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaseFactory } from '../../../../libs/ddd/domain/base-classes/factory.base'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { MCC } from '../../../merchant/domain/value-objects/mcc.value-object'
import { TransactionOrmEntity } from '../../database/transaction/transaction.orm-entity'
import { TransactionRepository } from '../../database/transaction/transaction.repository'
import { BaasAuthorizationResponseCode } from '../value-objects/baas-authorization-response-code.value-object'
import { TransactionAdvantageRepartition } from '../value-objects/transaction-advantage-repartition.value-object'
import { TransactionEntity, TransactionProps } from './transaction.entity'
import {
  TransactionDeclinedReason,
  TransactionStatus,
} from './transaction.types'

interface TransactionFactoryProps {
  cardId: UUID
  employeeId: UUID
  merchantId?: string
  merchantName?: string
  mcc?: MCC
  cardPublicToken?: string
  paymentDate?: DateVO
  amount?: number
  status?: TransactionStatus
  authorizationNote?: string
  authorizationResponseCode?: BaasAuthorizationResponseCode
  declinedReason?: TransactionDeclinedReason
  advantageRepartition?: TransactionAdvantageRepartition
  cashbackId?: UUID
}

export class TransactionFactory extends BaseFactory<
  TransactionEntity,
  TransactionFactoryProps,
  TransactionRepository,
  TransactionOrmEntity
> {
  protected getRepo(app: INestApplication) {
    return app.get(TransactionRepository)
  }

  protected buildEntity(defaultData: TransactionFactoryProps) {
    const randomAmount = faker.number.float({ max: -0.01, min: -19 })
    const props: TransactionProps = {
      externalTransactionId: faker.string.numeric(10),
      externalPaymentId: faker.string.numeric(10),
      merchantId: 'test',
      merchantName: 'test',
      mcc: new MCC('1020'),
      cardPublicToken: 'test',
      paymentDate: new DateVO(new Date()),
      amount: randomAmount,
      status: faker.datatype.boolean()
        ? TransactionStatus.Declined
        : TransactionStatus.Accepted,
      authorizationNote: '',
      authorizationResponseCode: new BaasAuthorizationResponseCode('00'),
      advantageRepartition: new TransactionAdvantageRepartition({
        MEALTICKET: defaultData.amount ? defaultData.amount : randomAmount,
      }),
      authorizationMti: '100',
      ...defaultData,
    }
    return new TransactionEntity({
      id: UUID.generate(),
      props: props,
    })
  }
}
