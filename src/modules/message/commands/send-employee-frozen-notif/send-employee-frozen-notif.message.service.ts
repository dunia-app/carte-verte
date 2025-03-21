import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { EmployeeFrozenDomainEvent } from '../../../organization/domain/events/employee-frozen.domain-event'
import { MessageEntity } from '../../domain/entities/message.entity'
import { NotificationType } from '../../domain/entities/notification.types'
import { MessageTemplateName } from '../../domain/entities/template.types'

let variables: {}

const notificationTypes: NotificationType[] = [NotificationType.PUSH]

function getWillSendAt(): Date {
  return new Date()
}

export async function sendEmployeeFrozenNotif(
  event: EmployeeFrozenDomainEvent,
  unitOfWork: UnitOfWork,
) {
  if (!event.correlationId) {
    throw new Error('Correlation ID is required')
  }

  const receiver = await unitOfWork
    .getReceiverRepository(event.correlationId)
    .findOneByEmployeeIdOrThrow(event.aggregateId)

  variables = {}
  const message = MessageEntity.create({
    receiverId: receiver.id,
    templateName: MessageTemplateName.EMPLOYEE_FROZEN_ACCOUNT,
    variables: variables,
    skipReceiverConsent: true,
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
