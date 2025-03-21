import { MessageEntity } from '../../../../../modules/message/domain/entities/message.entity';
import { NotificationEntity } from '../../../../../modules/message/domain/entities/notification.entity';
import { BaseNotificationOptions } from '../../../../../modules/message/domain/entities/notification.types';
import { TemplateEntity } from '../../../../../modules/message/domain/entities/template.entity';
import { MessageTemplateName } from '../../../../../modules/message/domain/entities/template.types';
import { MessageReceiverInfo, NotificationPayload, NotificationTransportHandler } from '../transport-handler.base';

class DefaultNotificationTransportHandler extends NotificationTransportHandler<any, BaseNotificationOptions> {
  public transformMessageToPayload(notification: NotificationEntity, message: MessageEntity, receiver?: MessageReceiverInfo | undefined, template?: TemplateEntity | undefined): Promise<NotificationPayload<any, any>[]> {
    throw new Error('Method not implemented.');
  }
  public async sendMessages(messages: any[]): Promise<any[]> {
    throw new Error('Method not implemented.');
  }

  public testReplaceVariables(notifOptions: BaseNotificationOptions, template: TemplateEntity): BaseNotificationOptions {
    return this.replaceVariables(notifOptions, template);
  }
}

describe('TransportHandler', () => {
  let transportHandler: DefaultNotificationTransportHandler;

  beforeEach(() => {
    transportHandler = new DefaultNotificationTransportHandler();
  });

  describe('replaceVariables', () => {
    it('should replace variables in the notification options content and title', () => {
      // Arrange
      const content = 'Hello, :name! You are :age years old.';
      const title = 'Welcome, :name!';
      const notifOptions: BaseNotificationOptions = {
        variables: {
          ["name"]: 'John Doe',
          ["age"]: 30,
        },
        content: content,
        title: title,
      };

      const templateProps = {
        templateName: MessageTemplateName.CONFIRM_MANDATE,
        allowedNotificationType: [],
        content: content,
        title: title,
        unsubscribable: false,
      }

      const template: TemplateEntity = TemplateEntity.create(templateProps);

      // Act
      const result = transportHandler.testReplaceVariables(notifOptions, template);

      // Assert
      expect(result.content).toBe('Hello, John Doe! You are 30 years old.');
      expect(result.title).toBe('Welcome, John Doe!');
    });

    it('should handle variables case insensitively', () => {
      // Arrange
      const content = 'Hello, :name! You are :age years old.';
      const title = 'Welcome, :name!';
      const notifOptions: BaseNotificationOptions = {
        variables: {
          ["NAME"]: 'Jane Smith',
          ["AGE"]: 25,
        },
        content: content,
        title: title,
      };

      const templateProps = {
        templateName: MessageTemplateName.CONFIRM_MANDATE,
        allowedNotificationType: [],
        content: content,
        title: title,
        unsubscribable: false,
      }

      const template: TemplateEntity = TemplateEntity.create(templateProps);


      // Act
      const result = transportHandler.testReplaceVariables(notifOptions, template);

      // Assert
      expect(result.content).toBe('Hello, Jane Smith! You are 25 years old.');
      expect(result.title).toBe('Welcome, Jane Smith!');
    });

    it('should return the template notification content if content and title are not provided in notification options', () => {
      // Arrange
      const notifOptions: BaseNotificationOptions = {
        variables: {
          name: 'Bob',
          age: 40,
        },
        content: undefined,
        title: undefined,
      };

      const templateProps = {
        templateName: MessageTemplateName.CONFIRM_MANDATE,
        allowedNotificationType: [],
        content: "default content",
        title: undefined,
        unsubscribable: false,
      }

      const template: TemplateEntity = TemplateEntity.create(templateProps);

      // Act
      const result = transportHandler.testReplaceVariables(notifOptions, template);

      // Assert
      expect(result.variables).toEqual(notifOptions.variables);
      expect(result.content).toBe(template.content);
      expect(result.title).toBeUndefined();
    });
  });
});