import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  CardAcquisitionEntity,
  CardAcquisitionProps,
} from '../../domain/entities/card-acquisition.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface CardAcquisitionRepositoryPort
  extends RepositoryPort<CardAcquisitionEntity, CardAcquisitionProps> {
  findOneByExternalIdOrThrow(externalId: string): Promise<CardAcquisitionEntity>
  findOneActiveByEmployeeId(
    employeeId: string,
  ): Promise<CardAcquisitionEntity | null>
  findOneActiveByEmployeeIdOrThrow(
    employeeId: string,
  ): Promise<CardAcquisitionEntity>
  exists(externalId: string): Promise<boolean>
  findManyByExternalIds(externalIds: string[]): Promise<CardAcquisitionEntity[]>
  findManyPending(): Promise<CardAcquisitionEntity[]>
}
