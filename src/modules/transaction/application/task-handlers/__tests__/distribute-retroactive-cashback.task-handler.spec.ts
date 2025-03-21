import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import redlock from 'redlock'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { DateVO } from '../../../../../libs/ddd/domain/value-objects/date.value-object'
import { onboardAsEmployee } from '../../../../../tests/auth_users'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../../tests/test_utils'
import { CardModule } from '../../../../card/card.module'
import { AdvantageType } from '../../../../merchant/domain/entities/advantage.types'
import { MerchantCategoryEntity } from '../../../../merchant/domain/entities/merchant-category.entity'
import { MerchantCategoryFactory } from '../../../../merchant/domain/entities/merchant-category.factory'
import { MerchantEntity } from '../../../../merchant/domain/entities/merchant.entity'
import { MerchantFactory } from '../../../../merchant/domain/entities/merchant.factory'
import { MerchantModule } from '../../../../merchant/merchant.module'
import {
  CommissionType,
  OrganizationOffer,
} from '../../../../organization/domain/value-objects/organization-offer.value-object'
import { TransactionModule } from '../../../../transaction/transaction.module'
import { WalletRepository } from '../../../../wallet/database/wallet/wallet.repository'
import { WalletModule } from '../../../../wallet/wallet.module'
import { TransactionRepository } from '../../../database/transaction/transaction.repository'
import { TransactionEntity } from '../../../domain/entities/transaction.entity'
import { TransactionFactory } from '../../../domain/entities/transaction.factory'
import { TransactionStatus } from '../../../domain/entities/transaction.types'
import { TransferEntity } from '../../../domain/entities/transfer.entity'
import { TransferFactory } from '../../../domain/entities/transfer.factory'
import { DistributeRetroactiveCashbackTaskHandler } from '../distribute-retroactive-cashback.task-handler'

describe('DistributeRetroactiveCashback (Task Handler)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    transactionRepo: TransactionRepository,
    walletRepo: WalletRepository,
    handler: DistributeRetroactiveCashbackTaskHandler,
  })

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [WalletModule, CardModule, MerchantModule, TransactionModule],
      },
      services,
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()

    jest
      .spyOn(services.redis.redlock, 'lock')
      .mockResolvedValue({} as redlock.Lock)
  })

  it('Should distribute retroactive cashback', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      undefined,
      undefined,
      {
        offer: new OrganizationOffer({
          advantageInShops: 100,
          commission: 0,
          commissionType: CommissionType.PERCENT,
          physicalCardPrice: 0,
          firstPhysicalCardPrice: 0
        }),
      },
    )

    const newMerchantCategory: MerchantCategoryEntity =
      await MerchantCategoryFactory.saveOne(app)
    const merchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      isCashbackableSince: new DateVO(new Date()),
    })

    const transaction: TransactionEntity = await TransactionFactory.saveOne(
      app,
      {
        cardId: card.id,
        employeeId: authInfo.user.id,
        merchantId: merchant.mid,
        merchantName: merchant.name,
        mcc: newMerchantCategory.mcc,
        cardPublicToken: card.publicToken,
        paymentDate: new DateVO(new Date()),
        amount: -faker.number.int({
          min: 5,
          max: 11,
        }),
        status: TransactionStatus.Accepted,
      },
    )

    await services.handler.handleRetroactiveCashback()

    const [transactionSaved, mealTicketWalletSaved, noneWalletSaved] =
      await Promise.all([
        services.transactionRepo.findOneByIdOrThrow(transaction.id.value),
        services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
          authInfo.user.id.value,
          AdvantageType.MEALTICKET,
        ),
        services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
          authInfo.user.id.value,
          AdvantageType.NONE,
        ),
      ])
    expect(transactionSaved.getPropsCopy().cashbackId).toBeTruthy()
    expect(mealTicketWalletSaved.authorizedBalance).toBeCloseTo(0)
    expect(mealTicketWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(-transaction.amount)
    expect(noneWalletSaved.balance).toBeCloseTo(-transaction.amount)
  })

  it('Should not distribute retroactive cashback cause transaction not concerned', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    const newMerchantCategory: MerchantCategoryEntity =
      await MerchantCategoryFactory.saveOne(app)
    const merchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })

    const transaction: TransactionEntity = await TransactionFactory.saveOne(
      app,
      {
        cardId: card.id,
        employeeId: authInfo.user.id,
        merchantId: merchant.mid,
        merchantName: merchant.name,
        mcc: newMerchantCategory.mcc,
        cardPublicToken: card.publicToken,
        paymentDate: new DateVO(new Date()),
        amount: -faker.number.int({
          min: 5,
          max: 11,
        }),
        status: TransactionStatus.Accepted,
      },
    )

    await services.handler.handleRetroactiveCashback()

    const [transactionSaved, mealTicketWalletSaved, noneWalletSaved] =
      await Promise.all([
        services.transactionRepo.findOneByIdOrThrow(transaction.id.value),
        services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
          authInfo.user.id.value,
          AdvantageType.MEALTICKET,
        ),
        services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
          authInfo.user.id.value,
          AdvantageType.NONE,
        ),
      ])
    expect(transactionSaved.getPropsCopy().cashbackId).toBeFalsy()
    expect(mealTicketWalletSaved.authorizedBalance).toBeCloseTo(0)
    expect(mealTicketWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(0)
    expect(noneWalletSaved.balance).toBeCloseTo(0)
  })

  it('Should not distribute retroactive cashback cause transaction already cashbacked', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    const newMerchantCategory: MerchantCategoryEntity =
      await MerchantCategoryFactory.saveOne(app)
    const merchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })
    const transfer: TransferEntity = await TransferFactory.saveOne(app)

    const transaction: TransactionEntity = await TransactionFactory.saveOne(
      app,
      {
        cardId: card.id,
        employeeId: authInfo.user.id,
        merchantId: merchant.mid,
        merchantName: merchant.name,
        mcc: newMerchantCategory.mcc,
        cardPublicToken: card.publicToken,
        paymentDate: new DateVO(new Date()),
        amount: -faker.number.int({
          min: 5,
          max: 11,
        }),
        status: TransactionStatus.Accepted,
        cashbackId: transfer.id,
      },
    )

    await services.handler.handleRetroactiveCashback()

    const [transactionSaved, mealTicketWalletSaved, noneWalletSaved] =
      await Promise.all([
        services.transactionRepo.findOneByIdOrThrow(transaction.id.value),
        services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
          authInfo.user.id.value,
          AdvantageType.MEALTICKET,
        ),
        services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
          authInfo.user.id.value,
          AdvantageType.NONE,
        ),
      ])
    expect(transactionSaved.getPropsCopy().cashbackId?.value).toBe(
      transfer.id.value,
    )
    expect(mealTicketWalletSaved.authorizedBalance).toBeCloseTo(0)
    expect(mealTicketWalletSaved.balance).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(0)
    expect(noneWalletSaved.balance).toBeCloseTo(0)
  })

  afterAll(async () => {
    await app.close()
  })
})