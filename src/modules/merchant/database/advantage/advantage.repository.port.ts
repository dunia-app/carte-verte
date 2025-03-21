import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  AdvantageEntity,
  AdvantageProps,
} from '../../domain/entities/advantage.entity'
import { AdvantageType } from '../../domain/entities/advantage.types'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface AdvantageRepositoryPort
  extends RepositoryPort<AdvantageEntity, AdvantageProps> {
  findOneByTypeOrThrow(type: AdvantageType): Promise<AdvantageEntity>
  findMany(): Promise<AdvantageEntity[]>
  exists(type: string): Promise<boolean>
  isMccAllowed(mcc: string): Promise<boolean>
  findManyAllowedForMid(mid: string): Promise<AdvantageEntity[]>
  findManyAllowedForMcc(mcc: string): Promise<AdvantageEntity[]>
}
