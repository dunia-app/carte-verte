import moment = require('moment')
import { pauseExec } from '../../../../helpers/application.helper'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { EmployeeRepositoryPort } from '../../../organization/database/employee/employee.repository.port'
import { MessageRepositoryPort } from '../../database/message/message.repository.port'
import { NotificationRepositoryPort } from '../../database/notification/notification.repository.port'
import { MessageEntity } from '../../domain/entities/message.entity'
import { NotificationType } from '../../domain/entities/notification.types'
import { MessageTemplateName } from '../../domain/entities/template.types'
import { SendEmployeeAccountTutorialCommand } from './send-employee-account-tutorial.command'

const maxIterations = 1000
const batchSize = 5000

let variables: {
  employeeFirstname: string
}

const notificationTypes: NotificationType[] = [NotificationType.MAIL]
const daysSinceAccountCreation = [1, 60]
const templateNames = [
  [
    MessageTemplateName.EMPLOYEE_ACCOUNT_TUTORIAL,
    MessageTemplateName.EMPLOYEE_ACCOUNT_TUTORIAL_NO_CASHBACK,
  ],
  [
    MessageTemplateName.EMPLOYEE_SATISFACTION_WITH_ADVANTAGE,
    MessageTemplateName.EMPLOYEE_SATISFACTION_NO_ADVANTAGE,
  ],
]

function getWillSendAt(): Date {
  return moment().hour(7).minute(0).toDate()
}

export async function sendEmployeeAccountTutorial(
  command: SendEmployeeAccountTutorialCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<null, ExceptionBase>> {
  const employeeRepo: EmployeeRepositoryPort = unitOfWork.getEmployeeRepository(
    command.correlationId,
  )
  const messageRepo: MessageRepositoryPort = unitOfWork.getMessageRepository(
    command.correlationId,
  )
  const notificationRepo: NotificationRepositoryPort =
    unitOfWork.getNotificationRepository(command.correlationId)

  const total = await employeeRepo.employeeActivatedSinceCount(
    daysSinceAccountCreation,
  )
  if (total === 0) return Result.ok(null)

  for (let batchI = 0; batchI < total; batchI += batchSize) {
    const employeeActivatedSince = await employeeRepo.employeeActivatedSince(
      daysSinceAccountCreation,
      batchI,
      batchSize,
    )

    for (let i = 0; i < employeeActivatedSince.length; i++) {
      const employeeToNotify = employeeActivatedSince[i]
      variables = {
        employeeFirstname: employeeToNotify.firstname,
      }
      const templateName =
        templateNames[
          daysSinceAccountCreation.findIndex(
            (day) => day === employeeToNotify.daySince,
          )
        ][employeeToNotify.isCashbackElligible ? 0 : 1]
      const message = MessageEntity.create({
        receiverId: new UUID(employeeToNotify.receiverId),
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
      await messageRepo.save(message.message)
      await notificationRepo.saveMultiple(message.notifications)

      if (i % maxIterations === 0) await pauseExec()
    }
  }
  return Result.ok(null)
}
