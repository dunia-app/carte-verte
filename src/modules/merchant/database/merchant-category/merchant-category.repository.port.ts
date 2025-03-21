import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  MerchantCategoryEntity,
  MerchantCategoryProps,
} from '../../domain/entities/merchant-category.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface MerchantCategoryRepositoryPort
  extends RepositoryPort<MerchantCategoryEntity, MerchantCategoryProps> {
  findOneByMcc(mcc: string): Promise<MerchantCategoryEntity | undefined>
  findOneByMccOrThrow(mcc: string): Promise<MerchantCategoryEntity>
  findManyByMcc(mcc: string[]): Promise<MerchantCategoryEntity[]>
  exists(mcc: string): Promise<boolean>
}
