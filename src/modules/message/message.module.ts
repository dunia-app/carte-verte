import { Module, forwardRef } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MessageEmitterModule } from '../../infrastructure/message-emitter/message-emitter.module'
import { PushNotifEmitterModule } from '../../infrastructure/push-notif-emitter/push-notif-emitter.module'
import { SmsEmitterModule } from '../../infrastructure/sms-emitter/sms-emitter.module'
import { TransactionModule } from '../transaction/transaction.module'
import { DeletePdfFilesTaskHandler } from './application/task-handlers/delete-pdf-files.task-handler'
import { SendEmployeeAccountCreationReminderTaskHandler } from './application/task-handlers/send-employee-account-creation-reminder.task-handler'
import { SendNotificationToBeSentTaskHandler } from './application/task-handlers/send-notification-to-be-sent.task-handler'
import { InAppNotificationTransportService } from './application/transport-handlers/in-app-notification.transport-handler'
import { MailNotificationTransportService } from './application/transport-handlers/mail-notification.transport-handler'
import { PushNotificationTransportService } from './application/transport-handlers/push-notification.transport-handler'
import { SmsNotificationTransportService } from './application/transport-handlers/sms-notification.transport-handler'
import { AcceptNotificationCommandHandler } from './commands/accept-notification/accept-notification.command-handler'
import { AcceptNotificationGraphqlResolver } from './commands/accept-notification/accept-notification.resolver'
import { DeletePdfFilesCommandHandler } from './commands/delete-pdf-files/delete-pdf-files.command-handler'
import { DeletePdfFilesController } from './commands/delete-pdf-files/delete-pdf-files.task.controller'
import { EmailOptoutController } from './commands/email-optout/email-ouptout.controller'
import { PushReceiverDeviceTokenCommandHandler } from './commands/push-receiver-device-token/push-receiver-device-token.command-handler'
import { PushReceiverDeviceTokenGraphqlResolver } from './commands/push-receiver-device-token/push-receiver-device-token.resolver'
import { SendEmployeeAccountCreationReminderCommandHandler } from './commands/send-employee-account-creation-reminder/send-employee-account-creation-reminder.command-handler'
import { SendEmployeeAccountCreationReminderController } from './commands/send-employee-account-creation-reminder/send-employee-account-creation-reminder.task.controller'
import { SendEmployeeAccountTutorialCommandHandler } from './commands/send-employee-account-tutorial/send-employee-account-tutorial.command-handler'
import { SendEmployeeAccountTutorialController } from './commands/send-employee-account-tutorial/send-employee-account-tutorial.task.controller'
import { SendEmployeeNoTransactionReminderCommandHandler } from './commands/send-employee-no-transaction-reminder/send-employee-no-transaction-reminder.command-handler'
import { SendEmployeeNoTransactionReminderController } from './commands/send-employee-no-transaction-reminder/send-employee-no-transaction-reminder.task.controller'
import { SendEmployeeWeeklyFormCommandHandler } from './commands/send-employee-weekly-form/send-employee-weekly-form.command-handler'
import { SendEmployeeWeeklyFormController } from './commands/send-employee-weekly-form/send-employee-weekly-form.task.controller'
import { SendMonthlyCashbackReceivedCommandHandler } from './commands/send-monthly-cashback-received/send-monthly-cashback-received.command-handler'
import { SendMonthlyCashbackReceivedController } from './commands/send-monthly-cashback-received/send-monthly-cashback-received.task.controller'
import { SendNotificationCommandHandler } from './commands/send-notifications/send-notifications.command-handler'
import { SendNotificationsController } from './commands/send-notifications/send-notifications.task.controller'
import { MessageTemplateNameEnumOrmEntity } from './database/message-template-name-enum/message-template-name-enum.orm-entity'
import { MessageOrmEntity } from './database/message/message.orm-entity'
import { MessageRepository } from './database/message/message.repository'
import { NotificationOrmEntity } from './database/notification/notification.orm-entity'
import { NotificationRepository } from './database/notification/notification.repository'
import { ReceiverOrmEntity } from './database/receiver/receiver.orm-entity'
import { ReceiverRepository } from './database/receiver/receiver.repository'
import { TemplateOrmEntity } from './database/template/template.orm-entity'
import { TemplateRepository } from './database/template/template.repository'
import { messageProviders } from './message.providers'

const graphqlResolvers = [
  AcceptNotificationGraphqlResolver,
  PushReceiverDeviceTokenGraphqlResolver,
]

const repositories = [
  MessageRepository,
  NotificationRepository,
  TemplateRepository,
  ReceiverRepository,
]

const commandHandlers = [
  AcceptNotificationCommandHandler,
  DeletePdfFilesCommandHandler,
  SendEmployeeAccountCreationReminderCommandHandler,
  SendEmployeeAccountTutorialCommandHandler,
  SendEmployeeNoTransactionReminderCommandHandler,
  SendEmployeeWeeklyFormCommandHandler,
  SendMonthlyCashbackReceivedCommandHandler,
  SendNotificationCommandHandler,
  PushReceiverDeviceTokenCommandHandler,
  //transport services
  MailNotificationTransportService,
  PushNotificationTransportService,
  InAppNotificationTransportService,
  SmsNotificationTransportService,
]

const taskHandlers = [
  SendEmployeeAccountCreationReminderTaskHandler,
  SendNotificationToBeSentTaskHandler,
  DeletePdfFilesTaskHandler,
]

const eventHandlers = [...messageProviders]

const controllers = [
  DeletePdfFilesController,
  EmailOptoutController,
  SendEmployeeAccountCreationReminderController,
  SendEmployeeAccountTutorialController,
  SendEmployeeNoTransactionReminderController,
  SendEmployeeWeeklyFormController,
  SendNotificationsController,
  SendMonthlyCashbackReceivedController,
]

// const queryHandlers = []

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageOrmEntity,
      MessageTemplateNameEnumOrmEntity,
      NotificationOrmEntity,
      TemplateOrmEntity,
      ReceiverOrmEntity,
    ]),
    forwardRef(() => TransactionModule),
    CqrsModule,
    MessageEmitterModule,
    PushNotifEmitterModule,
    SmsEmitterModule,
  ],
  controllers: [...controllers],
  providers: [
    ...repositories,
    ...graphqlResolvers,
    ...commandHandlers,
    ...taskHandlers,
    ...eventHandlers,
    // ...queryHandlers,
  ],
  exports: [ReceiverRepository],
})
export class MessageModule {}
