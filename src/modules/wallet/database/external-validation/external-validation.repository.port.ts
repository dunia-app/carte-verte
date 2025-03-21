import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  ExternalValidationEntity,
  ExternalValidationProps,
} from '../../domain/entities/external-validation.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface ExternalValidationRepositoryPort
  extends RepositoryPort<ExternalValidationEntity, ExternalValidationProps> {
  exists(authorizationIssuerId: string): Promise<boolean>
  findOneByAuthorizationIssuerId(
    authorizationIssuerId: string,
  ): Promise<ExternalValidationEntity | undefined>
}
