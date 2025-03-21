import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  TransferEntity,
  TransferProps,
} from '../../domain/entities/transfer.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface TransferRepositoryPort
  extends RepositoryPort<TransferEntity, TransferProps> {
  findOneByWalletIdOrThrow(walletId: string): Promise<TransferEntity>
  exists(walletId: string): Promise<boolean>
}
