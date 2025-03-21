import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { MessageEntity } from '../../domain/entities/message.entity'
import { NotificationType } from '../../domain/entities/notification.types'
import { MessageTemplateName } from '../../domain/entities/template.types'
import { SendPinChangedNotifCommand } from './send-pin-changed-notif.command'

let variables: {
  employeeFirstname: string
}

const notificationTypes: NotificationType[] = [NotificationType.MAIL]

const templateName = MessageTemplateName.EMPLOYEE_CARD_PIN_CHANGED

function getWillSendAt(): Date {
  return new Date()
}

export async function sendPinChangedNotif(
  command: SendPinChangedNotifCommand,
  unitOfWork: UnitOfWork,
) {
  const receiver = await unitOfWork
    .getReceiverRepository(command.correlationId)
    .findOneByEmployeeIdOrThrow(command.employeeId)
  const user = await unitOfWork
    .getUserRepository(command.correlationId)
    .findOneByIdOrThrow(receiver.userId)

  variables = {
    employeeFirstname: user.name.firstname,
  }
  const message = MessageEntity.create({
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
  })
  await unitOfWork
    .getMessageRepository(command.correlationId)
    .save(message.message)
  await unitOfWork
    .getNotificationRepository(command.correlationId)
    .saveMultiple(message.notifications)
}
