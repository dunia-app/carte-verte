import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  SuperAdminEntity,
  SuperAdminProps,
} from '../../domain/entities/super-admin.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface SuperAdminRepositoryPort
  extends RepositoryPort<SuperAdminEntity, SuperAdminProps> {
  findOneByUserIdOrThrow(userId: string): Promise<SuperAdminEntity>
  exists(userId: string): Promise<boolean>
}
