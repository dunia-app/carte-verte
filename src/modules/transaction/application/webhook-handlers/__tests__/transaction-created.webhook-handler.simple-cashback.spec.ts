import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { toScale } from '../../../../../helpers/math.helper'
import { BaasWebhookModule } from '../../../../../infrastructure/baas/baas-webhook.module'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { Address } from '../../../../../libs/ddd/domain/value-objects/address.value-object'
import { TransactionCreatedWebhookPayload } from '../../../../../libs/ddd/infrastructure/baas/treezor-webhook.entity'
import { TreezorTransactionProps } from '../../../../../libs/ddd/infrastructure/baas/treezor.entity'
import { onboardAsEmployee } from '../../../../../tests/auth_users'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../../tests/test_utils'
import { CardModule } from '../../../../card/card.module'
import { MerchantMerchantOrganizationRepository } from '../../../../merchant/database/merchant-merchant-organization/merchant-merchant-organization.repository'
import { MerchantRepository } from '../../../../merchant/database/merchant/merchant.repository'
import { AdvantageType } from '../../../../merchant/domain/entities/advantage.types'
import { MerchantCategoryFactory } from '../../../../merchant/domain/entities/merchant-category.factory'
import { MerchantMerchantOrganizationEntity } from '../../../../merchant/domain/entities/merchant-merchant-organization.entity'
import { MerchantMerchantOrganizationFactory } from '../../../../merchant/domain/entities/merchant-merchant-organization.factory'
import { MerchantOrganizationEntity } from '../../../../merchant/domain/entities/merchant-organization.entity'
import { MerchantOrganizationFactory } from '../../../../merchant/domain/entities/merchant-organization.factory'
import { MerchantEntity } from '../../../../merchant/domain/entities/merchant.entity'
import { MerchantFactory } from '../../../../merchant/domain/entities/merchant.factory'
import { AdvantageForm } from '../../../../merchant/domain/entities/merchant.types'
import {
  CommissionType,
  OrganizationOffer,
} from '../../../../organization/domain/value-objects/organization-offer.value-object'
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
    merchantRepo: MerchantRepository,
    mmoRepo: MerchantMerchantOrganizationRepository,
    handler: TransactionCreatedWebhookHandler,
  })

  const defaultTransactionCreatedWebhookPayload: Partial<TreezorTransactionProps> =
    {
      merchantName: 'Biodemain',
      merchantCity: 'LILLE',
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

  it('Should store the declined transaction, not affect any balance and not create cashback', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      undefined,
      undefined,
      {
        offer: new OrganizationOffer({
          advantageInShops: 10,
          commission: 0,
          commissionType: CommissionType.PERCENT,
          physicalCardPrice: 0,
          firstPhysicalCardPrice: 0
        }),
      },
    )

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      advantageForm: AdvantageForm.CASHBACK,
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

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved, noneWalletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(wallet.authorizedBalance)
    expect(noneWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(0)
  })

  it('Should store the refund transaction, not affect any balance and not create cashback', async () => {
    const paymentAmount = -faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      undefined,
      undefined,
      {
        offer: new OrganizationOffer({
          advantageInShops: 10,
          commission: 0,
          commissionType: CommissionType.PERCENT,
          physicalCardPrice: 0,
          firstPhysicalCardPrice: 0
        }),
      },
    )

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      advantageForm: AdvantageForm.CASHBACK,
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

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved, noneWalletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(wallet.authorizedBalance)
    expect(noneWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(0)
  })

  it('Should store the cleared transaction, not affect any balance and not create cashback', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      undefined,
      undefined,
      {
        offer: new OrganizationOffer({
          advantageInShops: 10,
          commission: 0,
          commissionType: CommissionType.PERCENT,
          physicalCardPrice: 0,
          firstPhysicalCardPrice: 0
        }),
      },
    )

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      advantageForm: AdvantageForm.CASHBACK,
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

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved, noneWalletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(wallet.authorizedBalance)
    expect(noneWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(0)
  })

  it('Should store the accepted transaction, affect only the authorized balance and create cashback', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      {
        balance: new Balance(paymentAmount + 1),
        authorizedBalance: new Balance(paymentAmount + 1),
      },
      undefined,
      {
        offer: new OrganizationOffer({
          advantageInShops: 10,
          commission: 0,
          commissionType: CommissionType.PERCENT,
          physicalCardPrice: 0,
          firstPhysicalCardPrice: 0
        }),
      },
    )
    const cashbackValue = toScale((paymentAmount * 10) / 100)

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      advantageForm: AdvantageForm.CASHBACK,
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

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved, noneWalletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
    expect(noneWalletSaved.balance).toBeCloseTo(cashbackValue)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(cashbackValue)
  })

  it('Should store the reversed transaction, affect only the authorized balance and not create cashback', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      {
        balance: new Balance(paymentAmount),
      },
      undefined,
      {
        offer: new OrganizationOffer({
          advantageInShops: 10,
          commission: 0,
          commissionType: CommissionType.PERCENT,
          physicalCardPrice: 0,
          firstPhysicalCardPrice: 0
        }),
      },
    )

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      advantageForm: AdvantageForm.CASHBACK,
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

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved, noneWalletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(paymentAmount)
    expect(noneWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(0)
  })

  it('Should store the settled transaction and affect only the balance and not create cashback', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      {
        balance: new Balance(paymentAmount + 1),
        authorizedBalance: new Balance(1),
      },
      undefined,
      {
        offer: new OrganizationOffer({
          advantageInShops: 10,
          commission: 0,
          commissionType: CommissionType.PERCENT,
          physicalCardPrice: 0,
          firstPhysicalCardPrice: 0
        }),
      },
    )

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      advantageForm: AdvantageForm.CASHBACK,
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

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved, noneWalletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(1)
    expect(walletSaved.authorizedBalance).toBeCloseTo(wallet.authorizedBalance)
    expect(noneWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(0)
  })

  it('Should store the settled transaction and affect both balances and not create cashback', async () => {
    const paymentAmount = -faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      undefined,
      undefined,
      {
        offer: new OrganizationOffer({
          advantageInShops: 10,
          commission: 0,
          commissionType: CommissionType.PERCENT,
          physicalCardPrice: 0,
          firstPhysicalCardPrice: 0
        }),
      },
    )

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      advantageForm: AdvantageForm.CASHBACK,
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

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved, noneWalletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(-paymentAmount)
    expect(walletSaved.authorizedBalance).toBeCloseTo(-paymentAmount)
    expect(noneWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(0)
  })

  it('Should store the accepted transaction, affect only the authorized balance and create cashback after matching existing merchant by siret = mid', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      {
        balance: new Balance(paymentAmount + 1),
        authorizedBalance: new Balance(paymentAmount + 1),
      },
      undefined,
      {
        offer: new OrganizationOffer({
          advantageInShops: 10,
          commission: 0,
          commissionType: CommissionType.PERCENT,
          physicalCardPrice: 0,
          firstPhysicalCardPrice: 0
        }),
      },
    )
    const cashbackValue = toScale((paymentAmount * 10) / 100)

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const siret = faker.string.numeric(14)
    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      mid: `*${siret}`,
      advantageForm: AdvantageForm.CASHBACK,
    })
    await MerchantOrganizationFactory.saveOne(app, {
      siret: siret,
      address: new Address({
        city: defaultTransactionCreatedWebhookPayload.merchantCity!,
      }),
    })

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          cardId: card.externalId,
          merchantId: `*${siret}`,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: faker.string.numeric(6),
          paymentStatus: 'A',
        },
      ],
    } as TransactionCreatedWebhookPayload

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [
      transactionSaved,
      walletSaved,
      noneWalletSaved,
      merchantSaved,
      mmoSaved,
    ] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
      services.merchantRepo.findManyByMid(newMerchant.mid!),
      services.mmoRepo.findOneByMid(newMerchant.mid!),
    ])

    // Transaction
    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
    // Cashback
    expect(noneWalletSaved.balance).toBeCloseTo(cashbackValue)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(cashbackValue)
    // Match merchant
    expect(merchantSaved.length).toBe(1)
    expect(merchantSaved[0].id.value).toBe(newMerchant.id.value)
    expect(mmoSaved).toBeTruthy()
    expect(mmoSaved?.mid).toBe(newMerchant.mid)
    expect(mmoSaved?.siret).toBe(siret)
  })

  it('Should store the accepted transaction, affect only the authorized balance and create cashback after matching existing merchant by name', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      {
        balance: new Balance(paymentAmount + 1),
        authorizedBalance: new Balance(paymentAmount + 1),
      },
      undefined,
      {
        offer: new OrganizationOffer({
          advantageInShops: 10,
          commission: 0,
          commissionType: CommissionType.PERCENT,
          physicalCardPrice: 0,
          firstPhysicalCardPrice: 0
        }),
      },
    )
    const cashbackValue = toScale((paymentAmount * 10) / 100)

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const name = faker.company.name()
    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      name: name,
      advantageForm: AdvantageForm.CASHBACK,
      address: new Address({
        city: defaultTransactionCreatedWebhookPayload.merchantCity!,
      }),
    })
    const newMerchantOrganization: MerchantOrganizationEntity =
      await MerchantOrganizationFactory.saveOne(app, {
        brandName: name,
        address: new Address({
          city: defaultTransactionCreatedWebhookPayload.merchantCity!,
        }),
      })

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          merchantName: name,
          cardId: card.externalId,
          merchantId: newMerchant.mid,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: faker.string.numeric(6),
          paymentStatus: 'A',
        },
      ],
    } as TransactionCreatedWebhookPayload

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [
      transactionSaved,
      walletSaved,
      noneWalletSaved,
      merchantSaved,
      mmoSaved,
    ] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
      services.merchantRepo.findManyByMid(newMerchant.mid!),
      services.mmoRepo.findOneByMid(newMerchant.mid!),
    ])

    // Transaction
    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
    // Cashback
    expect(noneWalletSaved.balance).toBeCloseTo(cashbackValue)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(cashbackValue)
    // Match merchant
    expect(merchantSaved.length).toBe(1)
    expect(merchantSaved[0].id.value).toBe(newMerchant.id.value)
    expect(mmoSaved).toBeTruthy()
    expect(mmoSaved?.mid).toBe(newMerchant.mid)
    expect(mmoSaved?.siret).toBe(newMerchantOrganization.siret)
  })

  it('Should store the accepted transaction, affect only the authorized balance and create cashback after failed matching existing merchant', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      {
        balance: new Balance(paymentAmount + 1),
        authorizedBalance: new Balance(paymentAmount + 1),
      },
      undefined,
      {
        offer: new OrganizationOffer({
          advantageInShops: 10,
          commission: 0,
          commissionType: CommissionType.PERCENT,
          physicalCardPrice: 0,
          firstPhysicalCardPrice: 0
        }),
      },
    )
    const cashbackValue = toScale((paymentAmount * 10) / 100)

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      name: faker.company.name(),
      advantageForm: AdvantageForm.CASHBACK,
    })
    await MerchantOrganizationFactory.saveOne(app, {
      brandName: faker.company.name(),
      address: new Address({
        city: defaultTransactionCreatedWebhookPayload.merchantCity!,
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
          paymentId: faker.string.numeric(6),
          paymentStatus: 'A',
        },
      ],
    } as TransactionCreatedWebhookPayload

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [
      transactionSaved,
      walletSaved,
      noneWalletSaved,
      merchantSaved,
      mmoSaved,
    ] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
      services.merchantRepo.findManyByMid(newMerchant.mid!),
      services.mmoRepo.findOneByMid(newMerchant.mid!),
    ])

    // Transaction
    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
    // Cashback
    expect(noneWalletSaved.balance).toBeCloseTo(cashbackValue)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(cashbackValue)
    // Match merchant
    expect(merchantSaved.length).toBe(1)
    expect(merchantSaved[0].id.value).toBe(newMerchant.id.value)
    expect(mmoSaved).toBeFalsy()
  })

  it('Should store the accepted transaction, affect only the authorized balance and create cashback after matching existing temporary merchant by name', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      {
        balance: new Balance(paymentAmount + 1),
        authorizedBalance: new Balance(paymentAmount + 1),
      },
      undefined,
      {
        offer: new OrganizationOffer({
          advantageInShops: 10,
          commission: 0,
          commissionType: CommissionType.PERCENT,
          physicalCardPrice: 0,
          firstPhysicalCardPrice: 0
        }),
      },
    )
    const cashbackValue = toScale((paymentAmount * 10) / 100)

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const siret = faker.string.numeric(14)
    const newMerchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      name: defaultTransactionCreatedWebhookPayload.merchantName,
      mid: `EKIPTEMPORARY*${siret}`,
      advantageForm: AdvantageForm.CASHBACK,
    })
    const newMerchantOrganization: MerchantOrganizationEntity =
      await MerchantOrganizationFactory.saveOne(app, {
        siret: siret,
        brandName: defaultTransactionCreatedWebhookPayload.merchantName,
        address: new Address({
          city: defaultTransactionCreatedWebhookPayload.merchantCity!,
        }),
      })
    const newMmo: MerchantMerchantOrganizationEntity =
      await MerchantMerchantOrganizationFactory.saveOne(app, {
        siret: siret,
        mid: newMerchant.mid,
      })

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          cardId: card.externalId,
          merchantId: faker.string.numeric(10),
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: faker.string.numeric(6),
          paymentStatus: 'A',
        },
      ],
    } as TransactionCreatedWebhookPayload

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [
      transactionSaved,
      walletSaved,
      noneWalletSaved,
      merchantSaved,
      mmoSaved,
    ] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
      services.merchantRepo.findManyByMid(
        payload.cardtransactions[0].merchantId,
      ),
      services.mmoRepo.findOneByMid(payload.cardtransactions[0].merchantId),
    ])

    // Transaction
    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
    // Cashback
    expect(noneWalletSaved.balance).toBeCloseTo(cashbackValue)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(cashbackValue)
    // Match merchant
    expect(merchantSaved.length).toBe(1)
    expect(merchantSaved[0].id.value).toBe(newMerchant.id.value)
    expect(merchantSaved[0].mid).toBe(payload.cardtransactions[0].merchantId)
    expect(mmoSaved).toBeTruthy()
    expect(mmoSaved?.id.value).toBe(newMmo.id.value)
    expect(mmoSaved?.mid).toBe(payload.cardtransactions[0].merchantId)
    expect(mmoSaved?.siret).toBe(newMerchantOrganization.siret)
  })

  it('Should store the accepted transaction, affect only the authorized balance and not create cashback after matching new merchant by siret = mid', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const name = faker.company.name()
    const siret = faker.string.numeric(14)
    const mid = `*${siret}`
    await MerchantOrganizationFactory.saveOne(app, {
      siret: siret,
      address: new Address({
        city: defaultTransactionCreatedWebhookPayload.merchantCity!,
      }),
    })

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          merchantName: name,
          cardId: card.externalId,
          merchantId: `*${siret}`,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: faker.string.numeric(6),
          paymentStatus: 'A',
        },
      ],
    } as TransactionCreatedWebhookPayload

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [
      transactionSaved,
      walletSaved,
      noneWalletSaved,
      merchantSaved,
      mmoSaved,
    ] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
      services.merchantRepo.findManyByMid(mid),
      services.mmoRepo.findOneByMid(mid),
    ])

    // Transaction
    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
    // Cashback
    expect(noneWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(0)
    // Match merchant
    expect(merchantSaved.length).toBe(1)
    expect(merchantSaved[0].mid).toBe(mid)
    expect(mmoSaved).toBeTruthy()
    expect(mmoSaved?.mid).toBe(mid)
    expect(mmoSaved?.siret).toBe(siret)
  })

  it('Should store the accepted transaction, affect only the authorized balance and not create cashback after matching new merchant by name', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const name = faker.company.name()
    const mid = faker.string.numeric(10)
    const newMerchantOrganization: MerchantOrganizationEntity =
      await MerchantOrganizationFactory.saveOne(app, {
        brandName: name,
        address: new Address({
          city: defaultTransactionCreatedWebhookPayload.merchantCity!,
        }),
      })

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          merchantName: name,
          cardId: card.externalId,
          merchantId: mid,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: faker.string.numeric(6),
          paymentStatus: 'A',
        },
      ],
    } as TransactionCreatedWebhookPayload

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [
      transactionSaved,
      walletSaved,
      noneWalletSaved,
      merchantSaved,
      mmoSaved,
    ] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
      services.merchantRepo.findManyByMid(mid),
      services.mmoRepo.findOneByMid(mid),
    ])

    // Transaction
    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
    // Cashback
    expect(noneWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(0)
    // Match merchant
    expect(merchantSaved.length).toBe(1)
    expect(merchantSaved[0].mid).toBe(mid)
    expect(mmoSaved).toBeTruthy()
    expect(mmoSaved?.mid).toBe(mid)
    expect(mmoSaved?.siret).toBe(newMerchantOrganization.siret)
  })

  it('Should store the accepted transaction, affect only the authorized balance and not create cashback after failed matching new merchant', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const name = faker.company.name()
    const mid = faker.string.numeric(10)
    await MerchantOrganizationFactory.saveOne(app, {
      brandName: faker.company.name(),
      address: new Address({
        city: defaultTransactionCreatedWebhookPayload.merchantCity!,
      }),
    })

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          merchantName: name,
          cardId: card.externalId,
          merchantId: mid,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: faker.string.numeric(6),
          paymentStatus: 'A',
        },
      ],
    } as TransactionCreatedWebhookPayload

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [
      transactionSaved,
      walletSaved,
      noneWalletSaved,
      merchantSaved,
      mmoSaved,
    ] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
      services.merchantRepo.findManyByMid(mid),
      services.mmoRepo.findOneByMid(mid),
    ])

    // Transaction
    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
    // Cashback
    expect(noneWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(0)
    // Match merchant
    expect(merchantSaved.length).toBe(1)
    expect(merchantSaved[0].mid).toBe(mid)
    expect(mmoSaved).toBeFalsy()
  })

  afterAll(async () => {
    await app.close()
  })
})
