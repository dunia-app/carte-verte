import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import { CardEntity, CardProps } from '../../domain/entities/card.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface CardRepositoryPort
  extends RepositoryPort<CardEntity, CardProps> {
  findCurrentOneByEmployeeIdOrThrow(employeeId: string): Promise<CardEntity>
  findOneByExternalIdOrThrow(externalId: string): Promise<CardEntity>
  findManyByExternalId(externalIds: string[]): Promise<CardEntity[]>
  findOneByPublicTokenOrThrow(publicToken: string): Promise<CardEntity>
  exists(employeeId: string): Promise<boolean>
  findManyAfterCreatedAt(createdAt: Date): Promise<CardEntity[]>
  findManyPhysicalCardNotCovered(organizationId: string): Promise<CardEntity[]>
  findManyPhysicalCardNotCoveredByEmployeeIds(
    employeeIds: string[],
    ): Promise<CardEntity[]>
  countPhysicalCardByEmployeeId(employeeId: string): Promise<number>
}
