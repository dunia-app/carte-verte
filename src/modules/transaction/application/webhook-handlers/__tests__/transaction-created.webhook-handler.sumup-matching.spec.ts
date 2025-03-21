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
import { MerchantMerchantOrganizationRepository } from '../../../../merchant/database/merchant-merchant-organization/merchant-merchant-organization.repository'
import { MerchantRepository } from '../../../../merchant/database/merchant/merchant.repository'
import { AdvantageType } from '../../../../merchant/domain/entities/advantage.types'
import { MerchantCategoryFactory } from '../../../../merchant/domain/entities/merchant-category.factory'
import { MerchantMerchantOrganizationFactory } from '../../../../merchant/domain/entities/merchant-merchant-organization.factory'
import { MerchantFactory } from '../../../../merchant/domain/entities/merchant.factory'
import { AdvantageForm } from '../../../../merchant/domain/entities/merchant.types'
import { CommissionType, OrganizationOffer } from '../../../../organization/domain/value-objects/organization-offer.value-object'
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
    merchantRepo : MerchantRepository,
    merchantMerchantOrganizationRepo : MerchantMerchantOrganizationRepository,
    handler: TransactionCreatedWebhookHandler,
  })

  const defaultTransactionCreatedWebhookPayload: Partial<TreezorTransactionProps> =
    {
      merchantName: 'SumUp*Toto',
      merchantCity: 'Lille',
      merchantCountry: 'FRA',
      paymentLocalTime: '94902',
      paymentLocalDate: '220817',
      paymentAmount: '15.5',
      paymentStatus: 'A',
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


  it('For payment solution, should not give cashback to a different restaurant with same mid', async () => {
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

    const transactionMerchantMid = faker.string.numeric(6)


    // Other merchant with the same mid that the one in the transaction but with a different name
    const merchantWithCashbackMcc = await MerchantCategoryFactory.saveOne(app)
    const merchantWithCashbackName = faker.company.name()
    const merchantWithCashback = await MerchantFactory.saveOne(app, {
      merchantCategory: merchantWithCashbackMcc,
      mid: transactionMerchantMid,
      name: merchantWithCashbackName,
      advantageForm: AdvantageForm.CASHBACK,
    })

    // The other merchant is already matched
    const newMerchantMerchantOrganization = await MerchantMerchantOrganizationFactory.saveOne(app,
      {
        mid: transactionMerchantMid,
        merchantName: merchantWithCashbackName,
      },
    )

    const cardtransactionId = faker.string.numeric(6)
    const payload: TransactionCreatedWebhookPayload = {
      cardtransactions: [
        {
          ...defaultTransactionCreatedWebhookPayload,
          cardId: card.externalId,
          merchantId: transactionMerchantMid,
          paymentAmount: paymentAmount.toString(),
          cardtransactionId: cardtransactionId,
          paymentId: faker.string.numeric(6),
        },
      ],
    } as TransactionCreatedWebhookPayload

    await services.redis.flushCache()
    const res = await services.handler.handle(cardtransactionId, payload)

    expect(res).toBe(true)
    const [transactionSaved, walletSaved, merchantSaved, noneWalletSaved] = await Promise.all([
      services.transactionRepo.findOneByExternalTransactionIdOrThrow(
        payload.cardtransactions[0].cardtransactionId,
      ),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.merchantRepo.findOneByMid(transactionMerchantMid),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.NONE,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(transactionSaved.merchantName).toBe('SumUp*Toto')

    expect(merchantSaved).toBeTruthy()

    expect(walletSaved.balance).toBeCloseTo(wallet.balance)
    expect(walletSaved.authorizedBalance).toBeCloseTo(1)
    expect(noneWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(0)
  })

  afterAll(async () => {
    await app.close()
  })
})
