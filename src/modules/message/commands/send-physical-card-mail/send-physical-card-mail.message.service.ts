import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { PhysicalCardRequestedDomainEvent } from '../../../card/domain/events/physical-card-requested.domain-event'
import { MessageRepositoryPort } from '../../database/message/message.repository.port'
import { NotificationRepositoryPort } from '../../database/notification/notification.repository.port'
import { MessageEntity } from '../../domain/entities/message.entity'
import { NotificationType } from '../../domain/entities/notification.types'
import { MessageTemplateName } from '../../domain/entities/template.types'

const templateName: MessageTemplateName =
  MessageTemplateName.EMPLOYEE_PHYSICAL_CARD_CONVERTED

let variables: { employeeFirstname: string }

const notificationTypes: NotificationType[] = [NotificationType.MAIL]

export async function sendPhysicalCardMail(
  unitOfWork: UnitOfWork,
  event: PhysicalCardRequestedDomainEvent,
) {
  if(!event.correlationId){
    throw new Error('CorrelationId is required')
  }
  const employee = await unitOfWork
    .getEmployeeRepository(event.correlationId)
    .findOneByIdOrThrow(event.employeeId)
  const [user, receiver] = await Promise.all([
    unitOfWork
      .getUserRepository(event.correlationId)
      .findOneByIdOrThrow(employee.userId),
    unitOfWork
      .getReceiverRepository(event.correlationId)
      .findOneByUserIdOrThrow(employee.userId.value),
  ])

  const messageRepo: MessageRepositoryPort = unitOfWork.getMessageRepository(
    event.correlationId,
  )

  const notificationRepo: NotificationRepositoryPort =
    unitOfWork.getNotificationRepository(event.correlationId)

  variables = {
    employeeFirstname: user.name.firstname,
  }
  const message = MessageEntity.create({
    receiverId: receiver.id,
    templateName: templateName,
    variables: variables,
    skipReceiverConsent: true,
    notificationsProps: notificationTypes.map((type) => {
      return {
        type: type,
        willSendAt: new Date(),
      }
    }),
  })
  await messageRepo.save(message.message)
  await notificationRepo.saveMultiple(message.notifications)
}
