import moment = require('moment')
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { MessageEntity } from '../../domain/entities/message.entity'
import { NotificationType } from '../../domain/entities/notification.types'
import { MessageTemplateName } from '../../domain/entities/template.types'
import { SendEmployeeRegisterEmailCommand } from './send-employee-register-email.command'

const templateName: MessageTemplateName =
  MessageTemplateName.EMPLOYEE_ACCOUNT_CREATION_INVITATION

let variables: {
  mealTicketAmount: number
  employeeFirstname: string
  coveragePercent: number
}

const notificationTypes: NotificationType[] = [NotificationType.MAIL]

function getWillSendAt(): Date {
  return moment().hour(8).minute(0).toDate()
}

export async function sendEmployeeRegisterEmail(
  unitOfWork: UnitOfWork,
  command: SendEmployeeRegisterEmailCommand,
): Promise<void> {
  const [users, receivers, organization] = await Promise.all([
    unitOfWork
      .getUserRepository(command.correlationId)
      .findManyById(command.userIds),
    unitOfWork
      .getReceiverRepository(command.correlationId)
      .findManyByUserIds(command.userIds),
    unitOfWork
      .getOrganizationRepository(command.correlationId)
      .findOneByIdOrThrow(command.organizationId),
  ])

  if (
    users.length != command.userIds.length ||
    receivers.length != command.userIds.length
  ) {
    throw new NotFoundException(
      `Some users/receivers were not found in event: ${command.id}`,
    )
  }
  const messages = users.map((user) => {
    const receiver = receivers.find(
      (receiver) => receiver.userId.value === user.id.value,
    )!
    variables = {
      employeeFirstname: user.name.firstname,
      mealTicketAmount:
        organization.settings && organization.settings.mealTicketAmount
          ? organization.settings.mealTicketAmount
          : 0,
      coveragePercent:
        organization.settings && organization.settings.coveragePercent
          ? organization.settings.coveragePercent
          : 0,
    }

    return MessageEntity.create({
      receiverId: receiver.id,
      templateName: templateName,
      variables: variables,
      skipReceiverConsent: true,
      notificationsProps: notificationTypes.map((type) => {
        return {
          type: type,
          willSendAt: getWillSendAt(),
        }
      }),
    })
  })
  await unitOfWork
    .getMessageRepository(command.correlationId)
    .saveMultiple(messages.map((message) => message.message))
  await unitOfWork
    .getNotificationRepository(command.correlationId)
    .saveMultiple(messages.map((message) => message.notifications).flat())
}
