import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  CardAcquisitionPayinEntity,
  CardAcquisitionPayinProps,
} from '../../domain/entities/card-acquisition-payin.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface CardAcquisitionPayinRepositoryPort
  extends RepositoryPort<
    CardAcquisitionPayinEntity,
    CardAcquisitionPayinProps
  > {
  findOneByReferenceOrThrow(
    reference: string,
  ): Promise<CardAcquisitionPayinEntity>
  findOneActiveByEmployeeId(
    employeeId: string,
  ): Promise<CardAcquisitionPayinEntity | undefined>
  findOneActiveByEmployeeIdOrThrow(
    employeeId: string,
  ): Promise<CardAcquisitionPayinEntity>
  findOneActiveByExternalCardAcquisitionId(
    externalCardAcquisitionId: string,
  ): Promise<CardAcquisitionPayinEntity | undefined>
  findOneActiveByExternalCardAcquisitionIdOrThrow(
    externalCardAcquisitionId: string,
  ): Promise<CardAcquisitionPayinEntity>
  findOneByTransactionExternalPaymentIdAuthorized(
    transactionExternalPaymentId: string,
  ): Promise<CardAcquisitionPayinEntity | undefined>
  findOneByTransactionExternalPaymentIdAuthorizedOrCaptured(
    transactionExternalPaymentId: string,
  ): Promise<CardAcquisitionPayinEntity | undefined>
  exists(externalId: string): Promise<boolean>
  findManyPending(): Promise<CardAcquisitionPayinEntity[]>
  findManyToBeExpired(): Promise<CardAcquisitionPayinEntity[]>
}
