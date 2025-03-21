import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { WalletEntity, WalletProps } from '../../domain/entities/wallet.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface WalletRepositoryPort
  extends RepositoryPort<WalletEntity, WalletProps> {
  findOneByEmployeeIdAndAdvantage(
    employeeId: string,
    advantage: AdvantageType,
  ): Promise<WalletEntity | undefined>
  findOneByEmployeeIdAndAdvantageOrThrow(
    employeeId: string,
    advantage: AdvantageType,
  ): Promise<WalletEntity>
  findManyByEmployeeId(employeeId: string): Promise<WalletEntity[]>
  findManyByEmployeeIds(employeeIds: string[]): Promise<WalletEntity[]>
  findManyByEmployeeIdAdvantage(
    employeeId: string[],
    advantage: AdvantageType,
  ): Promise<WalletEntity[]>
  exists(employeeId: string, advantage: AdvantageType): Promise<boolean>
  countWithExpiredMealTicket(): Promise<number>
  findManyWithExpiredMealTicket(
    batch?: number,
  ): Promise<WalletWithExpiredMealTicket[]>
}

export interface WalletWithExpiredMealTicket {
  readonly employeeId: string
  readonly walletId: string
  readonly mealTicketExpiredAmount: number
}
