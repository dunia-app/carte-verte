import { INestApplication } from '@nestjs/common'
import moment from 'moment'
import redlock from 'redlock'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { DateVO } from '../../../../../libs/ddd/domain/value-objects/date.value-object'
import {
  loginAsEmployee,
  onboardAsEmployee,
} from '../../../../../tests/auth_users'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../../tests/test_utils'
import { CardModule } from '../../../../card/card.module'
import { TransferFactory } from '../../../../transaction/domain/entities/transfer.factory'
import { WalletModule } from '../../../../wallet/wallet.module'
import { MessageRepository } from '../../../database/message/message.repository'
import { ReceiverRepository } from '../../../database/receiver/receiver.repository'
import { MessageTemplateName } from '../../../domain/entities/template.types'
import { MessageModule } from '../../../message.module'
import { SendEmployeeAccountCreationReminderTaskHandler } from '../send-employee-account-creation-reminder.task-handler'

describe('SendEmployeeAccountCreationReminder (Task Handler)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    receiverRepo: ReceiverRepository,
    messageRepo: MessageRepository,
    handler: SendEmployeeAccountCreationReminderTaskHandler,
  })

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [WalletModule, CardModule, MessageModule],
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

  it('Should not send a reminder cause employee too new', async () => {
    const { authInfo, wallet } = await loginAsEmployee(app)
    await TransferFactory.saveOne(app, {
      walletId: wallet.id,
    })

    await services.handler.handleEmployeeAccountCreationReminderToBeSent()

    const receiver = await services.receiverRepo.findOneByUserIdOrThrow(
      authInfo.user.userId.value,
    )
    const messageSaved = await services.messageRepo.findOne({
      receiverId: receiver.id,
      templateName: MessageTemplateName.EMPLOYEE_ACCOUNT_CREATION_REMINDER,
    })
    expect(messageSaved).toBeFalsy()
  })

  it('Should send a reminder', async () => {
    const { authInfo, wallet } = await loginAsEmployee(app)
    await TransferFactory.saveOne(app, {
      walletId: wallet.id,
      paymentDate: new DateVO(moment().subtract(15, 'days').toDate()),
    })

    await services.handler.handleEmployeeAccountCreationReminderToBeSent()

    const receiver = await services.receiverRepo.findOneByUserIdOrThrow(
      authInfo.user.userId.value,
    )
    const messageSaved = await services.messageRepo.findOne({
      receiverId: receiver.id,
      templateName: MessageTemplateName.EMPLOYEE_ACCOUNT_CREATION_REMINDER,
    })
    expect(messageSaved).toBeTruthy()
  })

  it('Should not send a reminder cause employee too old', async () => {
    const { authInfo, wallet } = await loginAsEmployee(app)
    await TransferFactory.saveOne(app, {
      walletId: wallet.id,
      paymentDate: new DateVO(moment().subtract(16, 'days').toDate()),
    })

    await services.handler.handleEmployeeAccountCreationReminderToBeSent()

    const receiver = await services.receiverRepo.findOneByUserIdOrThrow(
      authInfo.user.userId.value,
    )
    const messageSaved = await services.messageRepo.findOne({
      receiverId: receiver.id,
      templateName: MessageTemplateName.EMPLOYEE_ACCOUNT_CREATION_REMINDER,
    })
    expect(messageSaved).toBeFalsy()
  })

  it('Should not send a reminder cause employee is activated', async () => {
    const { authInfo, card, wallet } = await onboardAsEmployee(app)
    await TransferFactory.saveOne(app, {
      walletId: wallet.id,
      paymentDate: new DateVO(moment().subtract(16, 'days').toDate()),
    })

    await services.handler.handleEmployeeAccountCreationReminderToBeSent()

    const receiver = await services.receiverRepo.findOneByUserIdOrThrow(
      authInfo.user.userId.value,
    )
    const messageSaved = await services.messageRepo.findOne({
      receiverId: receiver.id,
      templateName: MessageTemplateName.EMPLOYEE_ACCOUNT_CREATION_REMINDER,
    })
    expect(messageSaved).toBeFalsy()
  })

  afterAll(async () => {
    await app.close()
  })
})