import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import { UserEntity, UserProps } from '../../domain/entities/user.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface UserRepositoryPort
  extends RepositoryPort<UserEntity, UserProps> {}
