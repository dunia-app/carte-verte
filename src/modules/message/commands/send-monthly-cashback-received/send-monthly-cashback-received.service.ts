import moment = require('moment')
import { pauseExec } from '../../../../helpers/application.helper'
import { toScale } from '../../../../helpers/math.helper'
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
import { SendMonthlyCashbackReceivedCommand } from './send-monthly-cashback-received.command'

const maxIterations = 1000
const batchSize = 5000

let variables: {
  employeeFirstname: string
  cashbackAmount: number
  cashbackAmountYear: number
}

let templateName: MessageTemplateName =
  MessageTemplateName.MONTHLY_CASHBACK_RECEIVED

const notificationTypes: NotificationType[] = [
  // NotificationType.MAIL
]

function getWillSendAt(): Date {
  return moment().hour(18).minute(0).toDate()
}

export async function sendMonthlyCashbackReceived(
  command: SendMonthlyCashbackReceivedCommand,
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

  const lastMonth = moment().subtract(1, 'month').startOf('month').toDate()
  const total = await employeeRepo.employeeSumCashbackSinceCount(lastMonth)
  if (total === 0) return Result.ok(null)

  for (let batchI = 0; batchI < total; batchI += batchSize) {
    const employeeTobeReminded = await employeeRepo.employeeSumCashbackSince(
      lastMonth,
      batchI,
      batchSize,
    )

    for (let i = 0; i < employeeTobeReminded.length; i++) {
      const employeeToBeReminded = employeeTobeReminded[i]
      variables = {
        employeeFirstname: employeeToBeReminded.firstname,
        cashbackAmount: toScale(employeeToBeReminded.cashbackAmount, 2),
        cashbackAmountYear: toScale(employeeToBeReminded.cashbackAmountYear, 2),
      }
      const message = MessageEntity.create({
        receiverId: new UUID(employeeToBeReminded.receiverId),
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
