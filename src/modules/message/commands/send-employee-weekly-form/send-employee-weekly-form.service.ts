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
import { SendEmployeeWeeklyFormCommand } from './send-employee-weekly-form.command'

const maxIterations = 1000
const batchSize = 5000

const variables = {}

const templateName: MessageTemplateName =
  MessageTemplateName.EMPLOYEE_WEEKLY_FORM

const notificationTypes: NotificationType[] = [NotificationType.PUSH]

function getWillSendAt(): Date {
  return moment().hour(7).minute(0).toDate()
}

export async function sendEmployeeWeeklyForm(
  command: SendEmployeeWeeklyFormCommand,
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

  const total = await employeeRepo.employeeActivatedCount()
  if (total === 0) return Result.ok(null)

  for (let batchI = 0; batchI < total; batchI += batchSize) {
    const employeeActivated = await employeeRepo.employeeActivatedReceiverIds(
      batchI,
      batchSize,
    )

    for (let i = 0; i < employeeActivated.length; i++) {
      const employeeToBeNotified = employeeActivated[i]
      const message = MessageEntity.create({
        receiverId: new UUID(employeeToBeNotified),
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
