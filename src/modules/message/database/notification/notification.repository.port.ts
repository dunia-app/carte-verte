import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  NotificationEntity,
  NotificationProps,
} from '../../domain/entities/notification.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface NotificationRepositoryPort
  extends RepositoryPort<NotificationEntity, NotificationProps> {
  findOneByMessageIdOrThrow(messageId: string): Promise<NotificationEntity>
  exists(messageId: string): Promise<boolean>
  messagesToBeSentCount(lessThanDate: Date): Promise<number>
  messagesToBeSent(
    lessThanDate: Date,
    batchSize: number,
  ): Promise<NotificationEntity[]>
}
