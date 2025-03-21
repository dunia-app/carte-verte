import { ConfigService } from '../../../../../infrastructure/config/config.service';
import { UUID } from '../../../../../libs/ddd/domain/value-objects/uuid.value-object';
import { EntityProps, OrmEntityProps } from '../../../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base';
import { CreateMessageProps, MessageEntity, MessageProps } from '../../../domain/entities/message.entity';
import { NotificationType } from '../../../domain/entities/notification.types';
import { MessageTemplateName } from '../../../domain/entities/template.types';
import { NotificationOrmEntity } from '../../notification/notification.orm-entity';
import { MessageOrmEntity } from '../message.orm-entity';
import { MessageOrmMapper } from '../message.orm-mapper';

class DefaultMessageOrmMapper extends MessageOrmMapper {
  public testToOrmProps(entity: MessageEntity): OrmEntityProps<MessageOrmEntity> {
    return this.toOrmProps(entity);
  }

  public testToDomainProps(ormEntity: MessageOrmEntity): EntityProps<MessageProps>  {
    return this.toDomainProps(ormEntity);
  }

}

describe('MessageOrmMapper', () => {
  let mapper: DefaultMessageOrmMapper;

  beforeEach(() => {
    mapper = new DefaultMessageOrmMapper(MessageEntity, MessageOrmEntity, new ConfigService());
  });

  describe('toOrmProps', () => {
    it('should map a MessageEntity to MessageOrmEntity properties', () => {
      // Arrange

      const props : CreateMessageProps = {
        receiverId: UUID.generate(),
        templateName: MessageTemplateName.CONFIRM_MANDATE,
        variables: { name: 'John Doe', age: 30 },
        skipReceiverConsent: true,
        filesPaths: ['file1.txt', 'file2.txt'],
        notificationsProps: [
          {
            type: NotificationType.MAIL,
            willSendAt: new Date(),
          },
          {
            type: NotificationType.SMS,
            willSendAt: new Date(),
          },
        ],
      };

      const entity = MessageEntity.create(props).message;

      // Act
      const result = mapper.testToOrmProps(entity);

      // Assert
      expect(result.receiverId).toBe(props.receiverId.value);
      expect(result.templateName).toBe(props.templateName);
      expect(result.variables).toEqual(props.variables);
      expect(result.skipReceiverConsent).toBe(true);
      expect(result.notifications).toHaveLength(2);
      expect(result.filesPaths).toEqual(props.filesPaths);
    });

    it('should map a MessageEntity without notifications to MessageOrmEntity properties', () => {
      // Arrange
      const id = UUID.generate();

      const props : MessageProps = {
        receiverId: UUID.generate(),
        templateName: MessageTemplateName.CONFIRM_MANDATE,
        variables: { name: 'John Doe', age: 30 },
        skipReceiverConsent: true,
        filesPaths: ['file1.txt', 'file2.txt'],
      };

      const entity = new MessageEntity({id, props});

      // Act
      const result = mapper.testToOrmProps(entity);

      // Assert
      expect(result.receiverId).toBe(props.receiverId.value);
      expect(result.templateName).toBe(props.templateName);
      expect(result.variables).toEqual(props.variables);
      expect(result.skipReceiverConsent).toBe(true);
      expect(result.notifications).toBeUndefined();
      expect(result.filesPaths).toEqual(props.filesPaths);
    });
  });

  describe('toDomainProps', () => {
    it('should map a MessageOrmEntity to MessageEntity properties', () => {
      // Arrange
      const ormEntity: MessageOrmEntity = new MessageOrmEntity();

      ormEntity.id = UUID.generate().value;
      ormEntity.receiverId = UUID.generate().value;
      ormEntity.templateName = MessageTemplateName.CONFIRM_MANDATE;
      ormEntity.variables = { name: 'John Doe', age: 30 };
      ormEntity.skipReceiverConsent = true;
      ormEntity.filesPaths = ['file1.txt', 'file2.txt'];
      ormEntity.notifications = [ new NotificationOrmEntity() ];


      // Act
      const result = mapper.testToDomainProps(ormEntity);

      // Assert
      expect(result.id.value).toBe(ormEntity.id);
      expect(result.props.receiverId.value).toBe(ormEntity.receiverId);
      expect(result.props.templateName).toBe(ormEntity.templateName);
      expect(result.props.variables).toEqual(ormEntity.variables);
      expect(result.props.skipReceiverConsent).toBe(true);
      expect(result.props.notifications).toBeUndefined();
      expect(result.props.filesPaths).toEqual(ormEntity.filesPaths);
    });

    it('should map a MessageOrmEntity without notifications to MessageEntity properties', () => {
      // Arrange
      const ormEntity: MessageOrmEntity = new MessageOrmEntity();

      ormEntity.id = UUID.generate().value;
      ormEntity.receiverId = UUID.generate().value;
      ormEntity.templateName = MessageTemplateName.CONFIRM_MANDATE;
      ormEntity.variables = { name: 'John Doe', age: 30 };
      ormEntity.skipReceiverConsent = true;
      ormEntity.filesPaths = ['file1.txt', 'file2.txt'];

      // Act
      const result = mapper.testToDomainProps(ormEntity);

      // Assert
      expect(result.id.value).toBe(ormEntity.id);
      expect(result.props.receiverId.value).toBe(ormEntity.receiverId);
      expect(result.props.templateName).toBe(ormEntity.templateName);
      expect(result.props.variables).toEqual(ormEntity.variables);
      expect(result.props.skipReceiverConsent).toBe(true);
      expect(result.props.notifications).toBeUndefined();
      expect(result.props.filesPaths).toEqual(ormEntity.filesPaths);
    });
  });
});