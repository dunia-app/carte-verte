import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  ReceiverEntity,
  ReceiverProps,
} from '../../domain/entities/receiver.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface ReceiverRepositoryPort
  extends RepositoryPort<ReceiverEntity, ReceiverProps> {
  findOneByUserIdOrThrow(userId: string): Promise<ReceiverEntity>
  findOneByEmployeeIdOrThrow(employeeId: string): Promise<ReceiverEntity>
  findManyByOrganizationId(
    organizationId: string,
    includeEmployee?: boolean,
    includeAdmin?: boolean,
  ): Promise<ReceiverEntity[]>
  findOneByEmailOrThrow(email: string): Promise<ReceiverEntity>
  findOneByEmail(email: string): Promise<ReceiverEntity | undefined>
  findManyByEmails(emails: string[]): Promise<ReceiverEntity[]>
  findManyByUserIds(userIds: string[]): Promise<ReceiverEntity[]>
  exists(email: string): Promise<boolean>
  getFindManyByIdMapById(
    receiverIds: string[],
  ): Promise<Map<string, ReceiverEntity>>
}
