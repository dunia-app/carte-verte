import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
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
import { TransactionEntity } from '../../../domain/entities/transaction.entity'
import { TransactionFactory } from '../../../domain/entities/transaction.factory'
import { TransactionStatus } from '../../../domain/entities/transaction.types'
import { TransactionAdvantageRepartition } from '../../../domain/value-objects/transaction-advantage-repartition.value-object'
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

  // TO DO : add tests for multiple successive transactions

  it('Should store the declined transaction and not affect any balance', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          cardId: card.externalId,
          merchantId: newMerchant.mid,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: faker.string.numeric(6),
          paymentStatus: 'I',
        },
      ],
    } as TransactionCreatedWebhookPayload

    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.getPropsCopy().balance.value).toBeCloseTo(
      wallet.getPropsCopy().balance.value,
    )
    expect(walletSaved.authorizedBalance).toBeCloseTo(wallet.authorizedBalance)
  })

  it('Should store the refund transaction and not affect any balance', async () => {
    const paymentAmount = -faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          cardId: card.externalId,
          merchantId: newMerchant.mid,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: faker.string.numeric(6),
          paymentStatus: 'R',
        },
      ],
    } as TransactionCreatedWebhookPayload

    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.getPropsCopy().balance.value).toBeCloseTo(
      wallet.getPropsCopy().balance.value,
    )
    expect(walletSaved.authorizedBalance).toBeCloseTo(wallet.authorizedBalance)
  })

  it('Should store the cleared transaction and not affect any balance', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          cardId: card.externalId,
          merchantId: newMerchant.mid,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: faker.string.numeric(6),
          paymentStatus: 'C',
        },
      ],
    } as TransactionCreatedWebhookPayload

    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.getPropsCopy().balance.value).toBeCloseTo(
      wallet.getPropsCopy().balance.value,
    )
    expect(walletSaved.authorizedBalance).toBeCloseTo(wallet.authorizedBalance)
  })

  it('Should store the accepted transaction and affect only the authorized balance', async () => {
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

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          cardId: card.externalId,
          merchantId: newMerchant.mid,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: faker.string.numeric(6),
          paymentStatus: 'A',
        },
      ],
    } as TransactionCreatedWebhookPayload

    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.getPropsCopy().balance.value).toBeCloseTo(
      wallet.getPropsCopy().balance.value,
    )
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
  })

  it('Should store the reversed transaction and affect only the authorized balance', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })

    const acceptedTransaction: TransactionEntity =
      await TransactionFactory.saveOne(app, {
        employeeId: authInfo.user.id,
        cardId: card.id,
        merchantId: newMerchant.mid,
        amount: -paymentAmount.toString(),
        externalTransactionId: faker.string.numeric(6),
        externalPaymentId: faker.string.numeric(6),
        status: TransactionStatus.Accepted,
        advantageRepartition: new TransactionAdvantageRepartition({
          MEALTICKET: -paymentAmount,
        }),
      })

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          cardId: card.externalId,
          merchantId: newMerchant.mid,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: acceptedTransaction.getPropsCopy().externalPaymentId,
          paymentStatus: 'V',
        },
      ],
    } as TransactionCreatedWebhookPayload

    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.getPropsCopy().balance.value).toBeCloseTo(
      wallet.getPropsCopy().balance.value,
    )
    expect(walletSaved.authorizedBalance).toBeCloseTo(paymentAmount)
  })

  it('Should store the settled transaction and affect only the balance', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(1),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })

    const acceptedTransaction: TransactionEntity =
      await TransactionFactory.saveOne(app, {
        employeeId: authInfo.user.id,
        cardId: card.id,
        merchantId: newMerchant.mid,
        amount: -paymentAmount.toString(),
        externalTransactionId: faker.string.numeric(6),
        externalPaymentId: faker.string.numeric(6),
        status: TransactionStatus.Accepted,
        advantageRepartition: new TransactionAdvantageRepartition({
          MEALTICKET: -paymentAmount,
        }),
      })

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          cardId: card.externalId,
          merchantId: newMerchant.mid,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: acceptedTransaction.getPropsCopy().externalPaymentId,
          paymentStatus: 'S',
        },
      ],
    } as TransactionCreatedWebhookPayload

    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.getPropsCopy().balance.value).toBeCloseTo(1)
    expect(walletSaved.authorizedBalance).toBeCloseTo(wallet.authorizedBalance)
  })

  it('Should store the settled transaction and affect both balances', async () => {
    const paymentAmount = -faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          cardId: card.externalId,
          merchantId: newMerchant.mid,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: faker.string.numeric(6),
          paymentStatus: 'S',
        },
      ],
    } as TransactionCreatedWebhookPayload

    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.getPropsCopy().balance.value).toBeCloseTo(-paymentAmount)
    expect(walletSaved.authorizedBalance).toBeCloseTo(-paymentAmount)
  })

  afterAll(async () => {
    await app.close()
  })
})
