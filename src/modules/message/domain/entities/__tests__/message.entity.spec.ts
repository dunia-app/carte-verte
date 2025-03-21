import { UUID } from '../../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  ChildNotificationProp,
  CreateMessageProps,
  MessageEntity,
} from '../message.entity'
import { NotificationEntity } from '../notification.entity'
import { NotificationType } from '../notification.types'
import { MessageTemplateName } from '../template.types'

describe('MessageEntity', () => {
  describe('create', () => {
    it('should create a new message and its notifications', () => {
      // Arrange
      const create: CreateMessageProps = {
        receiverId: UUID.generate(),
        templateName: MessageTemplateName.ORGANIZATION_ADMIN_ACCOUNT_CREATION_INVITATION,
        variables: { token: 'test-token', email: 'test-email@example.com' },
        skipReceiverConsent: false,
        filesPaths: ['/path/to/file1', '/path/to/file2'],
        notificationsProps: [
          { type: NotificationType.MAIL, willSendAt: new Date('2022-01-01T00:00:00Z') },
          { type: NotificationType.SMS, willSendAt: new Date('2022-01-02T00:00:00Z') },
        ],
      }

      // Act
      const result = MessageEntity.create(create)

      // Assert
      expect(result.message).toBeInstanceOf(MessageEntity)
      expect(result.notifications).toHaveLength(2)
      expect(result.notifications[0]).toBeInstanceOf(NotificationEntity)
      expect(result.notifications[1]).toBeInstanceOf(NotificationEntity)
      expect(result.notifications[0].type).toEqual(NotificationType.MAIL)
      expect(result.notifications[1].type).toEqual(NotificationType.SMS)
    })
  })

  describe('generateNotifications', () => {
    it('should generate notifications based on the provided props', () => {
      // Arrange
      const messageId = UUID.generate()
      const props: ChildNotificationProp[] = [
        { type: NotificationType.MAIL, willSendAt: new Date('2022-01-01T00:00:00Z') },
        { type: NotificationType.SMS, willSendAt: new Date('2022-01-02T00:00:00Z') },
      ]

      // Act
      const result = MessageEntity.generateNotifications(messageId, props)

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toBeInstanceOf(NotificationEntity)
      expect(result[1]).toBeInstanceOf(NotificationEntity)
      expect(result[0].messageId).toEqual(messageId)
      expect(result[1].messageId).toEqual(messageId)
      expect(result[0].type).toEqual(NotificationType.MAIL)
      expect(result[1].type).toEqual(NotificationType.SMS)
    })
  })
})