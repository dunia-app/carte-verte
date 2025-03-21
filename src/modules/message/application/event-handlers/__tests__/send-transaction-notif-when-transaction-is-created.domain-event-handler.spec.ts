import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { advantagesFixtures } from '../../../../../infrastructure/database/fixtures/advantage.fixtures'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { Address } from '../../../../../libs/ddd/domain/value-objects/address.value-object'
import { onboardAsEmployee } from '../../../../../tests/auth_users'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../../tests/test_utils'
import { CardModule } from '../../../../card/card.module'
import { MerchantCategoryEntity } from '../../../../merchant/domain/entities/merchant-category.entity'
import { MerchantCategoryFactory } from '../../../../merchant/domain/entities/merchant-category.factory'
import { MerchantEntity } from '../../../../merchant/domain/entities/merchant.entity'
import { MerchantFactory } from '../../../../merchant/domain/entities/merchant.factory'
import { CreateTransactionCommand } from '../../../../transaction/commands/create-transaction/create-transaction.command'
import { TransactionRepository } from '../../../../transaction/database/transaction/transaction.repository'
import {
  PANEntryMethod,
  TransactionStatus,
} from '../../../../transaction/domain/entities/transaction.types'
import { TransactionModule } from '../../../../transaction/transaction.module'
import { Balance } from '../../../../wallet/domain/value-objects/balance.value-object'
import { WalletModule } from '../../../../wallet/wallet.module'
import { MessageRepository } from '../../../database/message/message.repository'
import { ReceiverRepository } from '../../../database/receiver/receiver.repository'
import { MessageTemplateName } from '../../../domain/entities/template.types'
import { MessageModule } from '../../../message.module'
import { SendTransactionNotifWhenTransactionIsCreatedDomainEventHandler } from '../send-transaction-notif-when-transaction-is-created.domain-event-handler'

describe('SendTransactionNotifWhenTransactionIsCreated (DomainEvent Handler)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    commandBus: CommandBus,
    receiverRepo: ReceiverRepository,
    messageRepo: MessageRepository,
    transactionRepo: TransactionRepository,
    handler: SendTransactionNotifWhenTransactionIsCreatedDomainEventHandler,
  })

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [WalletModule, CardModule, MessageModule, TransactionModule],
      },
      services,
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()

    // needed fixtures :
    await advantagesFixtures()
  })

  it('Should send a validation accepted notif', async () => {
    const paymentAmount = -faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app, undefined, {
      balance: new Balance(paymentAmount + 1),
      authorizedBalance: new Balance(paymentAmount + 1),
    })

    const newMerchantCategory: MerchantCategoryEntity =
      await MerchantCategoryFactory.saveOne(app)
    const merchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      address: new Address({ city: 'Lille' }),
    })

    const command = new CreateTransactionCommand({
      externalCardId: card.externalId,
      mid: merchant.mid!,
      mcc: newMerchantCategory.mcc.value,
      merchantName: merchant.name,
      merchantCity: merchant.address!.city,
      merchantCountry: 'FRA',
      externalTransactionId: String(faker.string.numeric(6)),
      externalPaymentId: String(faker.string.numeric(6)),
      paymentDate: new Date(),
      amount: paymentAmount,
      status: TransactionStatus.Accepted,
      authorizationNote: '',
      authorizationResponseCode: '0',
      authorizationIssuerId: 'test',
      panEntryMethod: PANEntryMethod.UNKNOWN_OR_NO_TERMINAL,
      authorizationMti: 'test',
    })

    await services.commandBus.execute(command)

    const receiver = await services.receiverRepo.findOneByUserIdOrThrow(
      authInfo.user.userId.value,
    )
    const messageSaved = await services.messageRepo.findOne({
      receiverId: receiver.id,
      templateName: MessageTemplateName.PAYMENT_VALIDATION_ACCEPTED,
    })
    expect(messageSaved).toBeTruthy()
  })

  it('Should send a validation declined notif', async () => {
    const paymentAmount = -faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    const newMerchantCategory: MerchantCategoryEntity =
      await MerchantCategoryFactory.saveOne(app)
    const merchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      address: new Address({ city: 'Lille' }),
    })

    const command = new CreateTransactionCommand({
      externalCardId: card.externalId,
      mid: merchant.mid!,
      mcc: newMerchantCategory.mcc.value,
      merchantName: merchant.name,
      merchantCity: merchant.address!.city,
      merchantCountry: 'FRA',
      externalTransactionId: String(faker.string.numeric(6)),
      externalPaymentId: String(faker.string.numeric(6)),
      paymentDate: new Date(),
      amount: paymentAmount,
      status: TransactionStatus.Declined,
      authorizationNote: '',
      authorizationResponseCode: '0',
      authorizationIssuerId: 'test',
      panEntryMethod: PANEntryMethod.UNKNOWN_OR_NO_TERMINAL,
      authorizationMti: 'test',
    })

    await services.commandBus.execute(command)

    const receiver = await services.receiverRepo.findOneByUserIdOrThrow(
      authInfo.user.userId.value,
    )
    const messageSaved = await services.messageRepo.findOne({
      receiverId: receiver.id,
      templateName: MessageTemplateName.PAYMENT_VALIDATION_DECLINED,
    })
    expect(messageSaved).toBeTruthy()
  })

  it('Should not send a notif', async () => {
    const paymentAmount = -faker.number.float({
      min: 0.01,
      max: 19,
      fractionDigits: 2,
    })
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    const newMerchantCategory: MerchantCategoryEntity =
      await MerchantCategoryFactory.saveOne(app)
    const merchant: MerchantEntity = await MerchantFactory.saveOne(app, {
      merchantCategory: newMerchantCategory,
      address: new Address({ city: 'Lille' }),
    })

    const command = new CreateTransactionCommand({
      externalCardId: card.externalId,
      mid: merchant.mid!,
      mcc: newMerchantCategory.mcc.value,
      merchantName: merchant.name,
      merchantCity: merchant.address!.city,
      merchantCountry: 'FRA',
      externalTransactionId: String(faker.string.numeric(6)),
      externalPaymentId: String(faker.string.numeric(6)),
      paymentDate: new Date(),
      amount: paymentAmount,
      status: TransactionStatus.Settled,
      authorizationNote: '',
      authorizationResponseCode: '0',
      authorizationIssuerId: 'test',
      panEntryMethod: PANEntryMethod.UNKNOWN_OR_NO_TERMINAL,
      authorizationMti: 'test',
    })

    await services.commandBus.execute(command)

    const receiver = await services.receiverRepo.findOneByUserIdOrThrow(
      authInfo.user.userId.value,
    )
    const messageSaved = await services.messageRepo.findOne({
      receiverId: receiver.id,
      templateName: MessageTemplateName.PAYMENT_VALIDATION_DECLINED,
    })
    expect(messageSaved).toBeFalsy()
  })

  afterAll(async () => {
    await app.close()
  })
})
