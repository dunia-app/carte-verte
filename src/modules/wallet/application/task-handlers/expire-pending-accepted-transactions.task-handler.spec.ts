import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import moment from 'moment'
import redlock from 'redlock'
import { toScale } from '../../../../helpers/math.helper'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { onboardAsEmployee } from '../../../../tests/auth_users'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../tests/test_utils'
import { CardModule } from '../../../card/card.module'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { MerchantCategoryFactory } from '../../../merchant/domain/entities/merchant-category.factory'
import { MerchantFactory } from '../../../merchant/domain/entities/merchant.factory'
import { TransactionRepository } from '../../../transaction/database/transaction/transaction.repository'
import { TransactionEntity } from '../../../transaction/domain/entities/transaction.entity'
import { TransactionFactory } from '../../../transaction/domain/entities/transaction.factory'
import { TransactionStatus } from '../../../transaction/domain/entities/transaction.types'
import { TransactionAdvantageRepartition } from '../../../transaction/domain/value-objects/transaction-advantage-repartition.value-object'
import { TransactionModule } from '../../../transaction/transaction.module'
import { WalletRepository } from '../../../wallet/database/wallet/wallet.repository'
import { WalletModule } from '../../../wallet/wallet.module'
import { Balance } from '../../domain/value-objects/balance.value-object'
import { ExpirePendingAcceptedTransactionsTaskHandler } from './expire-pending-accepted-transactions.task-handler'

describe('ExpirePendingAcceptedTransactions (Task Handler)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    transactionRepo: TransactionRepository,
    walletRepo: WalletRepository,
    handler: ExpirePendingAcceptedTransactionsTaskHandler,
  })

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [WalletModule, CardModule, TransactionModule],
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

  it('Should expire the accepted transaction and affect the authorized balance', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })

    const tr: TransactionEntity = await TransactionFactory.saveOne(app, {
      cardId: card.id,
      employeeId: authInfo.user.id,
      merchant: newMerchant,
      paymentDate: new DateVO(moment().subtract(15, 'day').toDate()),
      amount: -paymentAmount,
      status: TransactionStatus.Accepted,
    })

    await services.handler.handlePendingAcceptedTransactionsToBeExpired()

    const [transactionSaved, walletSaved] = await Promise.all([
      services.transactionRepo.findOneByIdOrThrow(tr.id),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.isExpired).toBe(true)
    expect(walletSaved.getPropsCopy().balance.value).toBeCloseTo(
      wallet.getPropsCopy().balance.value,
    )
    expect(walletSaved.authorizedBalance).toBeCloseTo(
      wallet.authorizedBalance + paymentAmount,
    )
  })

  it('Should expire the accepted transaction and affect the authorized balance of 2 wallets', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const mealTicketPart = toScale(paymentAmount / 4)
    const nonePart = paymentAmount - mealTicketPart
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })

    const tr: TransactionEntity = await TransactionFactory.saveOne(app, {
      cardId: card.id,
      employeeId: authInfo.user.id,
      merchant: newMerchant,
      paymentDate: new DateVO(moment().subtract(15, 'day').toDate()),
      amount: -paymentAmount,
      status: TransactionStatus.Accepted,
      advantageRepartition: new TransactionAdvantageRepartition({
        MEALTICKET: -mealTicketPart,
        NONE: -nonePart,
      }),
    })

    await services.handler.handlePendingAcceptedTransactionsToBeExpired()

    const [transactionSaved, walletSaved, noneWalletSaved] = await Promise.all([
      services.transactionRepo.findOneByIdOrThrow(tr.id),
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
    expect(transactionSaved.isExpired).toBe(true)
    expect(walletSaved.getPropsCopy().balance.value).toBeCloseTo(
      wallet.getPropsCopy().balance.value,
    )
    expect(walletSaved.authorizedBalance).toBeCloseTo(
      wallet.authorizedBalance + mealTicketPart,
    )
    expect(noneWalletSaved.getPropsCopy().balance.value).toBeCloseTo(0)
    expect(noneWalletSaved.authorizedBalance).toBeCloseTo(nonePart)
  })

  it('Should keep the recent accepted transaction and not affect the authorized balance', async () => {
    const paymentAmount = faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount),
    })

    const newMerchantCategory = await MerchantCategoryFactory.saveOne(app)

    const newMerchant = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
    })

    const tr: TransactionEntity = await TransactionFactory.saveOne(app, {
      cardId: card.id,
      employeeId: authInfo.user.id,
      merchant: newMerchant,
      paymentDate: new DateVO(moment().subtract(5, 'day').toDate()),
      amount: -paymentAmount,
      status: TransactionStatus.Accepted,
    })

    await services.handler.handlePendingAcceptedTransactionsToBeExpired()

    const [transactionSaved, walletSaved] = await Promise.all([
      services.transactionRepo.findOneByIdOrThrow(tr.id),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
    ])

    expect(transactionSaved).toBeTruthy()
    expect(transactionSaved.isExpired).toBe(false)
    expect(walletSaved.getPropsCopy().balance.value).toBeCloseTo(
      wallet.getPropsCopy().balance.value,
    )
    expect(walletSaved.authorizedBalance).toBeCloseTo(wallet.authorizedBalance)
  })

  afterAll(async () => {
    await app.close()
  })
})