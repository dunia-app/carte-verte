import { fakerFR as faker } from "@faker-js/faker";
import { INestApplication } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import fs from 'fs';
import { RedisService } from "../../../../../infrastructure/redis/redis.service";
import { MessageReceiverInfo, NotificationPayload } from "../../../../../libs/ddd/domain/base-classes/transport-handler.base";
import { MailNotificationInfo } from "../../../../../libs/ddd/domain/ports/message-emitter.port";
import { DateVO } from "../../../../../libs/ddd/domain/value-objects/date.value-object";
import { Email } from "../../../../../libs/ddd/domain/value-objects/email.value-object";
import { UUID } from "../../../../../libs/ddd/domain/value-objects/uuid.value-object";
import { buildTypedServices, createTestModule } from "../../../../../tests/test_utils";
import { MessageRepository } from "../../../database/message/message.repository";
import { NotificationRepository } from "../../../database/notification/notification.repository";
import { ReceiverRepository } from "../../../database/receiver/receiver.repository";
import { MessageEntity } from "../../../domain/entities/message.entity";
import { NotificationEntity } from "../../../domain/entities/notification.entity";
import { NotificationEmailOption, NotificationType } from "../../../domain/entities/notification.types";
import { TemplateEntity } from "../../../domain/entities/template.entity";
import { MessageTemplateName } from "../../../domain/entities/template.types";
import { MessageModule } from "../../../message.module";
import { MailNotificationTransportService } from "../mail-notification.transport-handler";


describe('MailNotificationTransportService', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    commandBus: CommandBus,
    receiverRepo: ReceiverRepository,
    messageRepo: MessageRepository,
    notificationRepo : NotificationRepository,
    mailNotificationTransport : MailNotificationTransportService,
  })

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [MessageModule],
      },
      services,
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()
  })

  it('should send multiple mail notifications', async () => {
    // Arrange
    const filesNames = [
      '02fafea0-39db-4fb3-a469-4c0465027a16.02d753c6-0357-42ee-8bff-91d7dd65d863.pdf', 
      '0517c165-dfb3-4b21-a065-6ec13ae0d9ca.c501c935-f9b9-4ae8-a5cf-94d5104e3f04.pdf'
    ]

    const messages: NotificationPayload<MailNotificationInfo, NotificationEmailOption>[] = [
      {
        id: UUID.generate().value,
        payload: {
          to: {
            email: 'cyprien@ekip.app',
          },
          filesPaths : filesNames,
          textPart: 'Hello John Doe, your meal ticket command has been validated.',
          subject: 'Meal ticket command validated',
          templateID: 5743030
        },        
      }
    ];

    // Act
    const result = await services.mailNotificationTransport.sendMessages(messages);

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].response.result).toEqual("SUCCESS");

    const filesDeleted = !fs.existsSync(filesNames[0]) && !fs.existsSync(filesNames[1]);
    expect(filesDeleted).toBeTruthy();
  });

  it('should transform a message to a payload', async () => {
    // Arrange
    const notification: NotificationEntity = NotificationEntity.create({
      messageId: UUID.generate(),
      type: NotificationType.MAIL,
      willSendAt: new DateVO(new Date()),
    });

    const message: MessageEntity = MessageEntity.create({
      receiverId: UUID.generate(),
      templateName: MessageTemplateName.MEAL_TICKET_COMMAND_VALIDATED,
      variables: {
        "name": "John Doe",
      },
      skipReceiverConsent: true,
      notificationsProps: [
        {
          type: NotificationType.MAIL,
          willSendAt: new Date(),
        }
      ],
    }).message;

    const receiver: MessageReceiverInfo = {
      deviceTokens: [],
      email: new Email(faker.internet.email()),
    }

    const template: TemplateEntity = TemplateEntity.create({
      templateName: MessageTemplateName.MEAL_TICKET_COMMAND_VALIDATED,
      allowedNotificationType: [NotificationType.MAIL],
      content: 'Hello :name, your meal ticket command has been validated.',
      unsubscribable: true,
    });

    const mailNotifOpt: NotificationEmailOption = {
      title: template.title,
      content: template.content,
      variables: message.variables,
      email: receiver.email,
    };

    const transformedOpt: NotificationEmailOption = {
      title: template.title,
      content: template.content,
      variables: {
        ...message.variables,
        unsubscribable: template.unsubscribable
      },
      email: receiver.email,
    };

    const notificationPayload = {
      id: notification.id.value,
      transportsOptions: mailNotifOpt,
      payload: {
        to: {
          email: mailNotifOpt.email.value || receiver.email.value,
        },
        textPart: 'Hello John Doe, your meal ticket command has been validated.',
        subject: transformedOpt.title,
        variables: transformedOpt.variables,
        filesPaths: message.filesPaths ?? [],
      },
    };

    // Act
    const result = await services.mailNotificationTransport.transformMessageToPayload(
      notification,
      message,
      receiver,
      template,
    );

    // Assert
    expect(result).toHaveLength(1);

    // We are not testing the unsubscribe token
    delete result[0].payload.variables!.unsubscribeToken;

    expect(result[0]).toEqual(notificationPayload);
  });
 
  afterAll(async () => {
    await app.close()
  });

});