import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  MerchantEntity,
  MerchantProps,
} from '../../domain/entities/merchant.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface MerchantRepositoryPort
  extends RepositoryPort<MerchantEntity, MerchantProps> {
  findOneByMidOrThrow(mid: string): Promise<MerchantEntity>
  findOneByMid(mid: string): Promise<MerchantEntity | undefined>
  findManyByMid(mid: string): Promise<MerchantEntity[]>
  findManyByMids(mids: string[]): Promise<MerchantEntity[]>
  findManyByIsCashbackableSince(
    isCashbackableSince: Date,
  ): Promise<MerchantEntity[]>
  updateManyWithoutMcc(): Promise<void>
  exists(mid: string): Promise<boolean>
  getPaymentSolutions(): Promise<string[]>
}
