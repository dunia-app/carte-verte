import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import { AdvantageType } from '../../domain/entities/advantage.types'
import {
  MerchantFilterEntity,
  MerchantFilterProps,
} from '../../domain/entities/merchant-filter.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface MerchantFilterRepositoryPort
  extends RepositoryPort<MerchantFilterEntity, MerchantFilterProps> {
  findOneByCodeOrThrow(code: string): Promise<MerchantFilterEntity>
  exists(code: string): Promise<boolean>
  findManyByCode(codes: string[]): Promise<MerchantFilterEntity[]>
  findManyByParentCode(
    parentCode: AdvantageType,
  ): Promise<MerchantFilterEntity[]>
}
