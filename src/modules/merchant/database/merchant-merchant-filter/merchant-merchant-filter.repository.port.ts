import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  MerchantMerchantFilterEntity,
  MerchantMerchantFilterProps,
} from '../../domain/entities/merchant-merchant-filter.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface MerchantMerchantFilterRepositoryPort
  extends RepositoryPort<
    MerchantMerchantFilterEntity,
    MerchantMerchantFilterProps
  > {
  exists(code: string, mid: string): Promise<boolean>
  findManyByCode(code: string): Promise<MerchantMerchantFilterEntity[]>
  findManyByMid(mid: string): Promise<MerchantMerchantFilterEntity[]>
}
