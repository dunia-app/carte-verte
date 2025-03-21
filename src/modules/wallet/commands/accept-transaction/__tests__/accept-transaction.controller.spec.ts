import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import _ from 'lodash'
import moment from 'moment'
import { BankAccountManagerModule } from '../../../../../infrastructure/bank-account-manager/bank-account-manager.module'
import { CardAcquisitionServiceModule } from '../../../../../infrastructure/card-acquisition-service/card-acquisition-service.module'
import { advantagesFixtures } from '../../../../../infrastructure/database/fixtures/advantage.fixtures'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { UUID } from '../../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { DeepPartial } from '../../../../../libs/types'
import { onboardAsEmployee } from '../../../../../tests/auth_users'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../../tests/test_utils'
import { CardModule } from '../../../../card/card.module'
import { MerchantCategoryFactory } from '../../../../merchant/domain/entities/merchant-category.factory'
import { MCC } from '../../../../merchant/domain/value-objects/mcc.value-object'
import { BooleanByWeekday } from '../../../../organization/domain/value-objects/boolean-by-weekday.value-object'
import { TransactionRepository } from '../../../../transaction/database/transaction/transaction.repository'
import { TransactionFactory } from '../../../../transaction/domain/entities/transaction.factory'
import { TransactionModule } from '../../../../transaction/transaction.module'
import { ExternalValidationRepository } from '../../../database/external-validation/external-validation.repository'
import { ExternalValidationFactory } from '../../../domain/entities/external-validation.factory'
import { ExternalValidationResponseCode } from '../../../domain/entities/external-validation.types'
import { Balance } from '../../../domain/value-objects/balance.value-object'
import { WalletModule } from '../../../wallet.module'
import { ExternalValidationPayload } from '../accept-transaction.request.dto'
import { ExternalValidationResponse } from '../accept-transaction.response.dto'
import { buildAcceptTransactionRequests } from './accept-transaction.request'

jest.setTimeout(300000);

describe('AcceptTransaction (Controller)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    transactionRepo: TransactionRepository,
    externalValidationRepo: ExternalValidationRepository,
  })

  let requests: ReturnType<typeof buildAcceptTransactionRequests>
  const allowedMCC = '5411'
  const wrongMCC = '8888'
  const defaultExternalValidationPayload: DeepPartial<ExternalValidationPayload> =
    {
      request_id: UUID.generate(),
      payment_amount: {
        value_smallest_unit: 100,
        currency_code: 'EUR',
      },
      payment_local_amount: {
        value: 1,
        value_smallest_unit: 100,
        currency_code: 'EUR',
      },
      payment_local_time: '145958',
      authorization_issuer_id: 'test',
      merchant_data: {
        id: 'test',
        name: 'test',
        city: 'test',
        country_code: 'FRA',
        acquirer_id: 'test',
      },
    }

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [
          WalletModule,
          CardModule,
          TransactionModule,
          BankAccountManagerModule,
          CardAcquisitionServiceModule,
        ],
      },
      services,
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()
    requests = buildAcceptTransactionRequests(app)

    // needed fixtures :
    await MerchantCategoryFactory.saveOne(app, { mcc: new MCC(allowedMCC) })
    await MerchantCategoryFactory.saveOne(app, { mcc: new MCC(wrongMCC) })

    await advantagesFixtures()

    // Mock external validation saving because it is asynchronous
    jest
      .spyOn(services.externalValidationRepo, 'save')
      .mockResolvedValue(ExternalValidationFactory.buildOne())
  })

  it('Should declined the transaction cause not enough balance', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 25,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    const weekDate = new Date().getDay()
      ? new Date().toISOString()
      : moment().add('day').toISOString()
    const payload: ExternalValidationPayload = _.merge(
      defaultExternalValidationPayload,
      {
        payment_amount: {
          value: paymentAmount,
        },
        card_public_token: card.publicToken,
        request_date: weekDate,
        merchant_data: {
          mcc: allowedMCC,
        },
      },
    ) as ExternalValidationPayload

    const res = await requests.acceptTransaction(payload)

    const externalValidationRes: ExternalValidationResponse = {
      ...res.body,
    }
    expect(externalValidationRes.response_code).toBe(
      ExternalValidationResponseCode.DECLINED_INSUFFICIENT_FUNDS,
    )
  })

  it('Should declined the transaction cause using it on sunday', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 25,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const sundayDate = moment().startOf('week').toISOString()
    const payload: ExternalValidationPayload = _.merge(
      defaultExternalValidationPayload,
      {
        payment_amount: {
          value: paymentAmount,
        },
        card_public_token: card.publicToken,
        request_date: sundayDate,
        merchant_data: {
          mcc: allowedMCC,
        },
      },
    ) as ExternalValidationPayload

    const res = await requests.acceptTransaction(payload)

    const externalValidationRes: ExternalValidationResponse = {
      ...res.body,
    }
    expect(externalValidationRes.response_code).toBe(
      ExternalValidationResponseCode.DECLINED_DATETIME_INVALID,
    )
  })

  it('Should declined the transaction cause using it on public holiday', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 25,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const armistice = new Date(new Date().getFullYear(), 10, 11).toISOString()
    const payload: ExternalValidationPayload = _.merge(
      defaultExternalValidationPayload,
      {
        payment_amount: {
          value: paymentAmount,
        },
        card_public_token: card.publicToken,
        request_date: armistice,
        merchant_data: {
          mcc: allowedMCC,
        },
      },
    ) as ExternalValidationPayload

    const res = await requests.acceptTransaction(payload)

    const externalValidationRes: ExternalValidationResponse = {
      ...res.body,
    }
    expect(externalValidationRes.response_code).toBe(
      ExternalValidationResponseCode.DECLINED_DATETIME_INVALID,
    )
  })

  it('Should decline the wrong mcc transaction', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 25,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const weekDate = new Date().getDay()
      ? new Date().toISOString()
      : moment().add('day').toISOString()
    const payload: ExternalValidationPayload = _.merge(
      defaultExternalValidationPayload,
      {
        payment_amount: {
          value: paymentAmount,
        },
        card_public_token: card.publicToken,
        request_date: weekDate,
        merchant_data: {
          mcc: wrongMCC,
        },
      },
    ) as ExternalValidationPayload

    const res = await requests.acceptTransaction(payload)

    const externalValidationRes: ExternalValidationResponse = {
      ...res.body,
    }
    expect(externalValidationRes.response_code).toBe(
      ExternalValidationResponseCode.DECLINED_MERCHANTID_INVALID,
    )
  })

  it('Should decline the transaction because exceeding daily limit (no topup)', async() => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 25,
      fractionDigits: 2,
    });
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const weekDate = new Date().getDay()
      ? new Date().toISOString()
      : moment().add('day').toISOString()
    const payload: ExternalValidationPayload = _.merge(
      defaultExternalValidationPayload,
      {
        payment_amount: {
          value: paymentAmount,
        },
        card_public_token: card.publicToken,
        request_date: weekDate,
        merchant_data: {
          mcc: allowedMCC,
        },
      },
    ) as ExternalValidationPayload

    const res = await requests.acceptTransaction(payload);

    const externalValidationRes: ExternalValidationResponse = {
      ...res.body,
    }
    // First transaction should go through but not the second
    expect(externalValidationRes.response_code).toBe(
      ExternalValidationResponseCode.AUTHORIZED,
    );

    //We need to save the transaction
    //Only the amount and the card is important
    const firstTransaction = await TransactionFactory.saveOne(app, {
      cardId: card.id,
      employeeId: authInfo.user.id,
      amount: -paymentAmount
    })

    // We want the sum of the 2 payment to be above the daily limit of 25
    const paymentAmount2 = 25 - paymentAmount + 1

    const payload2: ExternalValidationPayload = _.merge(
      defaultExternalValidationPayload,
      {
        payment_amount: {
          value: paymentAmount2,
        },
        card_public_token: card.publicToken,
        request_date: weekDate,
        merchant_data: {
          mcc: allowedMCC,
        },
      },
    ) as ExternalValidationPayload

    const res2 = await requests.acceptTransaction(payload2);

    const externalValidationRes2: ExternalValidationResponse = {
      ...res2.body,
    }
    // First transaction should go through but not the second
    expect(externalValidationRes2.response_code).toBe(
      ExternalValidationResponseCode.DECLINED_INSUFFICIENT_FUNDS,
    );
  })

  it('Should accept the normal transaction', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 25,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const weekDate = new Date().getDay()
      ? new Date().toISOString()
      : moment().add('day').toISOString()
    const payload: ExternalValidationPayload = _.merge(
      defaultExternalValidationPayload,
      {
        payment_amount: {
          value: paymentAmount,
        },
        card_public_token: card.publicToken,
        request_date: weekDate,
        merchant_data: {
          mcc: allowedMCC,
        },
      },
    ) as ExternalValidationPayload

    const res = await requests.acceptTransaction(payload)

    const externalValidationRes: ExternalValidationResponse = {
      ...res.body,
    }
    expect(externalValidationRes.response_code).toBe(
      ExternalValidationResponseCode.AUTHORIZED,
    )
  })

  it('Should accept the weekend transaction', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 25,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      {
        mealTicketDays: new BooleanByWeekday({
          MONDAY: false,
          TUESDAY: false,
          WEDNESDAY: false,
          THURSDAY: false,
          FRIDAY: false,
          SATURDAY: false,
          SUNDAY: true,
        }),
      },
      {
        balance: new Balance(paymentAmount + 1),
        authorizedBalance: new Balance(paymentAmount + 1),
      },
    )

    const weekDate = new Date().getDay()
      ? new Date().toISOString()
      : moment().add('day').toISOString()
    const payload: ExternalValidationPayload = _.merge(
      defaultExternalValidationPayload,
      {
        payment_amount: {
          value: paymentAmount,
        },
        card_public_token: card.publicToken,
        request_date: weekDate,
        merchant_data: {
          mcc: allowedMCC,
        },
      },
    ) as ExternalValidationPayload

    const res = await requests.acceptTransaction(payload)

    const externalValidationRes: ExternalValidationResponse = {
      ...res.body,
    }
    expect(externalValidationRes.response_code).toBe(
      ExternalValidationResponseCode.AUTHORIZED,
    )
  })

  it('Should accept the transaction with cashback', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 25,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card, noneWallet } = await onboardAsEmployee(
        app, 
        undefined, 
        {
          balance: new Balance(0),
          authorizedBalance: new Balance(0),
        },
        undefined,
        undefined,
        undefined,
        {
          balance: new Balance(paymentAmount + 1),
          authorizedBalance: new Balance(paymentAmount + 1)
        }
    );


    const weekDate = new Date().getDay()
      ? new Date().toISOString()
      : moment().add('day').toISOString()
    const payload: ExternalValidationPayload = _.merge(
      defaultExternalValidationPayload,
      {
        payment_amount: {
          value: paymentAmount,
        },
        card_public_token: card.publicToken,
        request_date: weekDate,
        merchant_data: {
          mcc: allowedMCC,
        },
      },
    ) as ExternalValidationPayload

    const res = await requests.acceptTransaction(payload)

    const externalValidationRes: ExternalValidationResponse = {
      ...res.body,
    }
    expect(externalValidationRes.response_code).toBe(
      ExternalValidationResponseCode.AUTHORIZED,
    )
  })

  afterAll(async () => {
    await app.close()
  })
})
