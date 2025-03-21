import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { toScale } from '../../../../../helpers/math.helper'
import { BaasWebhookModule } from '../../../../../infrastructure/baas/baas-webhook.module'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { TransactionCreatedWebhookPayload } from '../../../../../libs/ddd/infrastructure/baas/treezor-webhook.entity'
import { TreezorTransactionProps } from '../../../../../libs/ddd/infrastructure/baas/treezor.entity'
import { onboardAsEmployee } from '../../../../../tests/auth_users'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../../tests/test_utils'
import { CardModule } from '../../../../card/card.module'
import { AdvantageType } from '../../../../merchant/domain/entities/advantage.types'
import { MerchantCategoryFactory } from '../../../../merchant/domain/entities/merchant-category.factory'
import { MerchantEntity } from '../../../../merchant/domain/entities/merchant.entity'
import { MerchantFactory } from '../../../../merchant/domain/entities/merchant.factory'
import { WalletRepository } from '../../../../wallet/database/wallet/wallet.repository'
import { Balance } from '../../../../wallet/domain/value-objects/balance.value-object'
import { WalletModule } from '../../../../wallet/wallet.module'
import { TransactionRepository } from '../../../database/transaction/transaction.repository'
import { TransactionModule } from '../../../transaction.module'
import { TransactionCreatedWebhookHandler } from '../transaction-created.webhook-handler'

describe('TransactionCreated (Webhook Handler)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    transactionRepo: TransactionRepository,
    walletRepo: WalletRepository,
    handler: TransactionCreatedWebhookHandler,
  })

  const defaultTransactionCreatedWebhookPayload: Partial<TreezorTransactionProps> =
    {
      merchantName: 'Biodemain',
      merchantCity: 'Lille',
      merchantCountry: 'FRA',
      paymentLocalTime: '94902',
      paymentLocalDate: '220817',
      paymentAmount: '15.5',
      paymentStatus: 'Accepted',
      authorizationNote: '',
      authorizationResponseCode: '00',
      mccCode: '5734',
      authorizationIssuerId: '',
      panEntryMethod: 0,
    }

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [
          WalletModule,
          CardModule,
          TransactionModule,
          BaasWebhookModule,
        ],
      },
      services,
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()
  })

  // TO DO : add tests for accepted and declined transaction
  // add tests for Non-Euro transactions
  // add tests for Direct settlement transaction

  it('Should store the accepted and single settled transaction and affect both balances', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })
    const payload = {
      ...defaultTransactionCreatedWebhookPayload,
      cardId: card.externalId,
      merchantId: newMerchant.mid,
      paymentAmount: paymentAmount.toString(),
      cardtransactionId: faker.string.numeric(6),
      paymentId: faker.string.numeric(6),
    }

    const acceptedPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'A',
          cardtransactionId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const settledPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'S',
          cardtransactionId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const acceptedRes = await services.handler.handle(
      payload.cardtransactionId,
      acceptedPayload,
    )
    const settledRes = await services.handler.handle(
      payload.cardtransactionId,
      settledPayload,
    )

    expect(acceptedRes).toBe(true)
    expect(settledRes).toBe(true)
    const [acceptedTransactionSaved, settledTransactionSaved, walletSaved] =
      await Promise.all([
        services.transactionRepo.findOneByExternalTransactionIdOrThrow(
          acceptedPayload.cardtransactions[0].cardtransactionId,
        ),
        services.transactionRepo.findOneByExternalTransactionIdOrThrow(
          settledPayload.cardtransactions[0].cardtransactionId,
        ),
        services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
          authInfo.user.id.value,
          AdvantageType.MEALTICKET,
        ),
      ])

    expect(acceptedTransactionSaved).toBeTruthy()
    expect(acceptedTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(settledTransactionSaved).toBeTruthy()
    expect(settledTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(1)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
  })

  it('Should store the accepted and multiple settled transactions and affect both balances', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })
    const payload = {
      ...defaultTransactionCreatedWebhookPayload,
      cardId: card.externalId,
      merchantId: newMerchant.mid,
      paymentAmount: paymentAmount.toString(),
      cardtransactionId: faker.string.numeric(6),
      paymentId: faker.string.numeric(6),
    }

    const acceptedPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'A',
          cardtransactionId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const settledPayload1: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'S',
          cardtransactionId: faker.string.numeric(6),
          paymentAmount: toScale(paymentAmount / 2).toString(),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const settledPayload2: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'S',
          cardtransactionId: faker.string.numeric(6),
          paymentAmount: (
            paymentAmount -
            Number(settledPayload1.cardtransactions[0].paymentAmount)
          ).toString(),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const acceptedRes = await services.handler.handle(
      payload.cardtransactionId,
      acceptedPayload,
    )
    const settledRes1 = await services.handler.handle(
      payload.cardtransactionId,
      settledPayload1,
    )
    const settledRes2 = await services.handler.handle(
      payload.cardtransactionId,
      settledPayload2,
    )

    expect(acceptedRes).toBe(true)
    expect(settledRes1).toBe(true)
    expect(settledRes2).toBe(true)
    const [
      acceptedTransactionSaved,
      settledTransactionSaved1,
      settledTransactionSaved2,
      walletSaved,
    ] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        acceptedPayload.cardtransactions[0].cardtransactionId,
      ),
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        settledPayload1.cardtransactions[0].cardtransactionId,
      ),
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        settledPayload2.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(acceptedTransactionSaved).toBeTruthy()
    expect(acceptedTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(settledTransactionSaved1).toBeTruthy()
    expect(settledTransactionSaved1.employeeId).toStrictEqual(authInfo.user.id)
    expect(settledTransactionSaved2).toBeTruthy()
    expect(settledTransactionSaved2.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(1)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
  })

  it('Should store the accepted, settled and reversal transaction and affect both balances', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })
    const payload = {
      ...defaultTransactionCreatedWebhookPayload,
      cardId: card.externalId,
      merchantId: newMerchant.mid,
      paymentAmount: paymentAmount.toString(),
      cardtransactionId: faker.string.numeric(6),
      paymentId: faker.string.numeric(6),
    }

    const acceptedPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'A',
          cardtransactionId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const settledPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'S',
          cardtransactionId: faker.string.numeric(6),
          paymentAmount: toScale(paymentAmount / 2).toString(),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const reversalPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'V',
          cardtransactionId: faker.string.numeric(6),
          paymentAmount: (
            paymentAmount -
            Number(settledPayload.cardtransactions[0].paymentAmount)
          ).toString(),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const acceptedRes = await services.handler.handle(
      payload.cardtransactionId,
      acceptedPayload,
    )
    const settledRes = await services.handler.handle(
      payload.cardtransactionId,
      settledPayload,
    )
    const reversalRes = await services.handler.handle(
      payload.cardtransactionId,
      reversalPayload,
    )

    expect(acceptedRes).toBe(true)
    expect(settledRes).toBe(true)
    expect(reversalRes).toBe(true)
    const [
      acceptedTransactionSaved,
      settledTransactionSaved,
      reversalTransactionSaved,
      walletSaved,
    ] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        acceptedPayload.cardtransactions[0].cardtransactionId,
      ),
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        settledPayload.cardtransactions[0].cardtransactionId,
      ),
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        reversalPayload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(acceptedTransactionSaved).toBeTruthy()
    expect(acceptedTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(settledTransactionSaved).toBeTruthy()
    expect(settledTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(reversalTransactionSaved).toBeTruthy()
    expect(reversalTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(
      1 +
        paymentAmount -
        Number(settledPayload.cardtransactions[0].paymentAmount),
    )
    expect(walletSaved.authorizedBalance).toBeCloseTo(
      1 +
        paymentAmount -
        Number(settledPayload.cardtransactions[0].paymentAmount),
    )
  })

  it('Should store the accepted, reversal and settled transaction and affect both balances', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })
    const payload = {
      ...defaultTransactionCreatedWebhookPayload,
      cardId: card.externalId,
      merchantId: newMerchant.mid,
      paymentAmount: paymentAmount.toString(),
      cardtransactionId: faker.string.numeric(6),
      paymentId: faker.string.numeric(6),
    }

    const acceptedPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'A',
          cardtransactionId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const reversalPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'V',
          cardtransactionId: faker.string.numeric(6),
          paymentAmount: toScale(paymentAmount / 2).toString(),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const settledPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'S',
          cardtransactionId: faker.string.numeric(6),
          paymentAmount: (
            paymentAmount -
            Number(reversalPayload.cardtransactions[0].paymentAmount)
          ).toString(),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const acceptedRes = await services.handler.handle(
      payload.cardtransactionId,
      acceptedPayload,
    )
    const reversalRes = await services.handler.handle(
      payload.cardtransactionId,
      reversalPayload,
    )
    const settledRes = await services.handler.handle(
      payload.cardtransactionId,
      settledPayload,
    )

    expect(acceptedRes).toBe(true)
    expect(reversalRes).toBe(true)
    expect(settledRes).toBe(true)
    const [
      acceptedTransactionSaved,
      reversalTransactionSaved,
      settledTransactionSaved,
      walletSaved,
    ] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        acceptedPayload.cardtransactions[0].cardtransactionId,
      ),
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        reversalPayload.cardtransactions[0].cardtransactionId,
      ),
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        settledPayload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(acceptedTransactionSaved).toBeTruthy()
    expect(acceptedTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(reversalTransactionSaved).toBeTruthy()
    expect(reversalTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(settledTransactionSaved).toBeTruthy()
    expect(settledTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(1 + toScale(paymentAmount / 2))
    expect(walletSaved.authorizedBalance).toBeCloseTo(
      1 + toScale(paymentAmount / 2),
    )
  })

  it('Should store the accepted and single reversal transaction and not affect any balances', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })
    const payload = {
      ...defaultTransactionCreatedWebhookPayload,
      cardId: card.externalId,
      merchantId: newMerchant.mid,
      paymentAmount: paymentAmount.toString(),
      cardtransactionId: faker.string.numeric(6),
      paymentId: faker.string.numeric(6),
    }

    const acceptedPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'A',
          cardtransactionId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const reversalPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'V',
          cardtransactionId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const acceptedRes = await services.handler.handle(
      payload.cardtransactionId,
      acceptedPayload,
    )
    const reversalRes = await services.handler.handle(
      payload.cardtransactionId,
      reversalPayload,
    )

    expect(acceptedRes).toBe(true)
    expect(reversalRes).toBe(true)
    const [acceptedTransactionSaved, reversalTransactionSaved, walletSaved] =
      await Promise.all([
        services.transactionRepo.findOneByExternalTransactionIdOrThrow(
          acceptedPayload.cardtransactions[0].cardtransactionId,
        ),
        services.transactionRepo.findOneByExternalTransactionIdOrThrow(
          reversalPayload.cardtransactions[0].cardtransactionId,
        ),
        services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
          authInfo.user.id.value,
          AdvantageType.MEALTICKET,
        ),
      ])

    expect(acceptedTransactionSaved).toBeTruthy()
    expect(acceptedTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(reversalTransactionSaved).toBeTruthy()
    expect(reversalTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(paymentAmount + 1)
    expect(walletSaved.authorizedBalance).toBeCloseTo(paymentAmount + 1)
  })

  it('Should store the accepted and multiple reversal transactions and not affect any balances', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })
    const payload = {
      ...defaultTransactionCreatedWebhookPayload,
      cardId: card.externalId,
      merchantId: newMerchant.mid,
      paymentAmount: paymentAmount.toString(),
      cardtransactionId: faker.string.numeric(6),
      paymentId: faker.string.numeric(6),
    }

    const acceptedPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'A',
          cardtransactionId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const reversalPayload1: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'V',
          cardtransactionId: faker.string.numeric(6),
          paymentAmount: toScale(paymentAmount / 2).toString(),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const reversalPayload2: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'V',
          cardtransactionId: faker.string.numeric(6),
          paymentAmount: (
            paymentAmount -
            Number(reversalPayload1.cardtransactions[0].paymentAmount)
          ).toString(),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const acceptedRes = await services.handler.handle(
      payload.cardtransactionId,
      acceptedPayload,
    )
    const reversalRes1 = await services.handler.handle(
      payload.cardtransactionId,
      reversalPayload1,
    )
    const reversalRes2 = await services.handler.handle(
      payload.cardtransactionId,
      reversalPayload2,
    )

    expect(acceptedRes).toBe(true)
    expect(reversalRes1).toBe(true)
    expect(reversalRes2).toBe(true)
    const [
      acceptedTransactionSaved,
      reversalTransactionSaved1,
      reversalTransactionSaved2,
      walletSaved,
    ] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        acceptedPayload.cardtransactions[0].cardtransactionId,
      ),
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        reversalPayload1.cardtransactions[0].cardtransactionId,
      ),
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        reversalPayload2.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(acceptedTransactionSaved).toBeTruthy()
    expect(acceptedTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(reversalTransactionSaved1).toBeTruthy()
    expect(reversalTransactionSaved1.employeeId).toStrictEqual(authInfo.user.id)
    expect(reversalTransactionSaved2).toBeTruthy()
    expect(reversalTransactionSaved2.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(paymentAmount + 1)
    expect(walletSaved.authorizedBalance).toBeCloseTo(paymentAmount + 1)
  })

  it('Should store the refund and settled transaction and affect both balances', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(1),
      authorizedBalance: new Balance(1),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })
    const payload = {
      ...defaultTransactionCreatedWebhookPayload,
      cardId: card.externalId,
      merchantId: newMerchant.mid,
      paymentAmount: (-paymentAmount).toString(),
      cardtransactionId: faker.string.numeric(6),
      paymentId: faker.string.numeric(6),
    }

    const refundPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'R',
          cardtransactionId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const settledPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'S',
          cardtransactionId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const refundRes = await services.handler.handle(
      payload.cardtransactionId,
      refundPayload,
    )
    const settledRes = await services.handler.handle(
      payload.cardtransactionId,
      settledPayload,
    )

    expect(refundRes).toBe(true)
    expect(settledRes).toBe(true)
    const [refundTransactionSaved, settledTransactionSaved, walletSaved] =
      await Promise.all([
        services.transactionRepo.findOneByExternalTransactionIdOrThrow(
          refundPayload.cardtransactions[0].cardtransactionId,
        ),
        services.transactionRepo.findOneByExternalTransactionIdOrThrow(
          settledPayload.cardtransactions[0].cardtransactionId,
        ),
        services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
          authInfo.user.id.value,
          AdvantageType.MEALTICKET,
        ),
      ])

    expect(refundTransactionSaved).toBeTruthy()
    expect(refundTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(settledTransactionSaved).toBeTruthy()
    expect(settledTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(paymentAmount + 1)
    expect(walletSaved.authorizedBalance).toBeCloseTo(paymentAmount + 1)
  })

  it('Should store the accepted and different amount settled transaction and affect both balances', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })
    const payload = {
      ...defaultTransactionCreatedWebhookPayload,
      cardId: card.externalId,
      merchantId: newMerchant.mid,
      cardtransactionId: faker.string.numeric(6),
      paymentId: faker.string.numeric(6),
    }

    const acceptedPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'A',
          paymentAmount: (paymentAmount - 1).toString(),
          cardtransactionId: faker.string.numeric(6),
          authorizationNote: 'Gen: Pre-Authorization Request',
        },
      ],
    } as TransactionCreatedWebhookPayload

    const settledPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'S',
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const acceptedRes = await services.handler.handle(
      payload.cardtransactionId,
      acceptedPayload,
    )
    const settledRes = await services.handler.handle(
      payload.cardtransactionId,
      settledPayload,
    )

    expect(acceptedRes).toBe(true)
    expect(settledRes).toBe(true)
    const [acceptedTransactionSaved, settledTransactionSaved, walletSaved] =
      await Promise.all([
        services.transactionRepo.findOneByExternalTransactionIdOrThrow(
          acceptedPayload.cardtransactions[0].cardtransactionId,
        ),
        services.transactionRepo.findOneByExternalTransactionIdOrThrow(
          settledPayload.cardtransactions[0].cardtransactionId,
        ),
        services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
          authInfo.user.id.value,
          AdvantageType.MEALTICKET,
        ),
      ])

    expect(acceptedTransactionSaved).toBeTruthy()
    expect(acceptedTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(settledTransactionSaved).toBeTruthy()
    expect(settledTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(1)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
  })

  it('Should store the accepted and different amount settled transaction and affect both balances', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })
    const payload = {
      ...defaultTransactionCreatedWebhookPayload,
      cardId: card.externalId,
      merchantId: newMerchant.mid,
      cardtransactionId: faker.string.numeric(6),
      paymentId: faker.string.numeric(6),
    }

    const acceptedPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'A',
          paymentAmount: (paymentAmount + 1).toString(),
          cardtransactionId: faker.string.numeric(6),
          authorizationNote: 'Gen: Pre-Authorization Request',
        },
      ],
    } as TransactionCreatedWebhookPayload

    const settledPayload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...payload,
          paymentStatus: 'S',
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    const acceptedRes = await services.handler.handle(
      payload.cardtransactionId,
      acceptedPayload,
    )
    const settledRes = await services.handler.handle(
      payload.cardtransactionId,
      settledPayload,
    )

    expect(acceptedRes).toBe(true)
    expect(settledRes).toBe(true)
    const [acceptedTransactionSaved, settledTransactionSaved, walletSaved] =
      await Promise.all([
        services.transactionRepo.findOneByExternalTransactionIdOrThrow(
          acceptedPayload.cardtransactions[0].cardtransactionId,
        ),
        services.transactionRepo.findOneByExternalTransactionIdOrThrow(
          settledPayload.cardtransactions[0].cardtransactionId,
        ),
        services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
          authInfo.user.id.value,
          AdvantageType.MEALTICKET,
        ),
      ])

    expect(acceptedTransactionSaved).toBeTruthy()
    expect(acceptedTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(settledTransactionSaved).toBeTruthy()
    expect(settledTransactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(1)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
  })

  afterAll(async () => {
    await app.close()
  })
})