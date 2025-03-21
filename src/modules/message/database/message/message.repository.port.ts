import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  MessageEntity,
  MessageProps,
} from '../../domain/entities/message.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface MessageRepositoryPort
  extends RepositoryPort<MessageEntity, MessageProps> {
  findOneByReceiverIdOrThrow(receiverId: string): Promise<MessageEntity>
  getFindManyByIdMapById(
    messageIds: string[],
  ): Promise<Map<string, MessageEntity>>
}
