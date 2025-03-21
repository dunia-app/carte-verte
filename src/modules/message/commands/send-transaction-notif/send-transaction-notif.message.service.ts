import { capitalizeEachWords } from '../../../../helpers/string.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import {
  declinedReasonToText,
  TransactionStatus,
} from '../../../transaction/domain/entities/transaction.types'
import { TransactionCreatedDomainEvent } from '../../../transaction/domain/events/transaction-created.domain-event'
import { MessageEntity } from '../../domain/entities/message.entity'
import { NotificationType } from '../../domain/entities/notification.types'
import { MessageTemplateName } from '../../domain/entities/template.types'

let variables: {
  textDeclinedReason?: string
  amount: number
  merchantName: string
}

const notificationTypes: NotificationType[] = [NotificationType.PUSH]

function getWillSendAt(): Date {
  return new Date()
}

export async function sendTransactionNotif(
  event: TransactionCreatedDomainEvent,
  unitOfWork: UnitOfWork,
) {
  // Do not send notif if amount === 0
  if (event.amount === 0) {
    return 0
  }
  if (!event.correlationId) {
    throw new Error('Correlation ID is required')
  }

  // Only notif for accepted and declined transactions
  if (
    event.transactionStatus !== TransactionStatus.Accepted &&
    event.transactionStatus !== TransactionStatus.Declined
  ) {
    return
  }
  const receiver = await unitOfWork
    .getReceiverRepository(event.correlationId)
    .findOneByEmployeeIdOrThrow(event.employeeId)

  const merchant = await unitOfWork
    .getMerchantRepository(event.correlationId)
    .findOneByMid(event.mid)

  variables = {
    textDeclinedReason: declinedReasonToText(event.declinedReason),
    // always display the absolute value of amount
    amount: Math.abs(event.amount),
    merchantName: capitalizeEachWords(merchant?.name ?? event.merchantName),
  }
  const message = MessageEntity.create({
    receiverId: receiver.id,
    templateName:
      event.transactionStatus === TransactionStatus.Accepted
        ? MessageTemplateName.PAYMENT_VALIDATION_ACCEPTED
        : MessageTemplateName.PAYMENT_VALIDATION_DECLINED,
    variables: variables,
    skipReceiverConsent: false,
    notificationsProps: notificationTypes.map((type) => {
      return {
        type: type,
        willSendAt: getWillSendAt(),
      }
    }),
  })
  await unitOfWork
    .getMessageRepository(event.correlationId)
    .save(message.message)
  await unitOfWork
    .getNotificationRepository(event.correlationId)
    .saveMultiple(message.notifications)
}
