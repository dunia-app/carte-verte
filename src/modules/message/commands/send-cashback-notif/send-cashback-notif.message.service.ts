import moment from 'moment'
import { capitalizeEachWords } from '../../../../helpers/string.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { maxCashbackPerMonth } from '../../../transaction/commands/distribute-cashback/distribute-cashback.service'
import { TransferCreatedDomainEvent } from '../../../transaction/domain/events/transfer-created.domain-event'
import { MessageEntity } from '../../domain/entities/message.entity'
import { NotificationEntity } from '../../domain/entities/notification.entity'
import { NotificationType } from '../../domain/entities/notification.types'
import { MessageTemplateName } from '../../domain/entities/template.types'

const templateName: MessageTemplateName = MessageTemplateName.CASHBACK_RECEIVED

let variables: {
  amount: number
  merchantName: string
}

const notificationTypes: NotificationType[] = [NotificationType.PUSH]
const firstNotificationTypes: NotificationType[] = [NotificationType.MAIL]
const maxNotificationTypes: NotificationType[] = [NotificationType.PUSH]

function getWillSendAt(): Date {
  return new Date()
}

// Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
export async function sendCashbackNotif(
  event: TransferCreatedDomainEvent,
  unitOfWork: UnitOfWork,
): Promise<void> {
  // Do not send notif if amount === 0
  if (event.amount === 0) {
    return
  }

  if (!event.correlationId) {
    throw new Error('CorrelationId is required')
  }

  const [wallet, transfer] = await Promise.all([
    unitOfWork
      .getWalletRepository(event.correlationId)
      .findOneByIdOrThrow(event.walletId),
    unitOfWork
      .getTransferRepository(event.correlationId)
      .findOneByWalletIdOrThrow(event.walletId),
  ])
  const employee = await unitOfWork
    .getEmployeeRepository(event.correlationId)
    .findOneByIdOrThrow(wallet.employeeId)

  const receiver = await unitOfWork
    .getReceiverRepository(event.correlationId)
    .findOneByUserIdOrThrow(employee.userId.value)

  const startOfMonth = moment().startOf('month').toDate()
  const cashbackSum = await unitOfWork
    .getEmployeeRepository(event.correlationId)
    .employeeSumCashback(wallet.employeeId, startOfMonth)

  variables = {
    // always display the absolute value of amount
    amount: Math.abs(event.amount),
    merchantName: capitalizeEachWords(event.merchantName!),
  }
  const message = [
    MessageEntity.create({
      receiverId: receiver.id,
      templateName: templateName,
      variables: variables,
      skipReceiverConsent: false,
      notificationsProps: notificationTypes.map((type) => {
        return {
          type: type,
          willSendAt: getWillSendAt(),
        }
      }),
    }),
  ]

  if (!transfer) {
    const user = await unitOfWork
      .getUserRepository(event.correlationId)
      .findOneByIdOrThrow(employee.userId.value)
    message.push(
      sendFirstCashbackNotif(receiver.id, user.name.firstname, event.amount),
    )
  }

  if (cashbackSum >= maxCashbackPerMonth) {
    message.push(sendMaxCashbackNotif(receiver.id))
  }

  await unitOfWork
    .getMessageRepository(event.correlationId)
    .saveMultiple(message.map((m) => m.message))
  await unitOfWork
    .getNotificationRepository(event.correlationId)
    .saveMultiple(message.map((m) => m.notifications).flat())
}

function sendFirstCashbackNotif(
  receiverId: UUID,
  employeeFirstname: string,
  cashbackAmount: number,
): {
  message: MessageEntity
  notifications: NotificationEntity[]
} {
  const firstCashbackVariables = {
    cashbackAmount: Math.abs(cashbackAmount),
    employeeFirstname: employeeFirstname,
  }

  return MessageEntity.create({
    receiverId: receiverId,
    templateName: MessageTemplateName.EMPLOYEE_FIRST_CASHBACK,
    variables: firstCashbackVariables,
    skipReceiverConsent: false,
    notificationsProps: firstNotificationTypes.map((type) => {
      return {
        type: type,
        willSendAt: getWillSendAt(),
      }
    }),
  })
}

function sendMaxCashbackNotif(receiverId: UUID): {
  message: MessageEntity
  notifications: NotificationEntity[]
} {
  return MessageEntity.create({
    receiverId: receiverId,
    templateName: MessageTemplateName.MAX_CASHBACK_REACHED,
    variables: {},
    skipReceiverConsent: false,
    notificationsProps: maxNotificationTypes.map((type) => {
      return {
        type: type,
        willSendAt: getWillSendAt(),
      }
    }),
  })
}
