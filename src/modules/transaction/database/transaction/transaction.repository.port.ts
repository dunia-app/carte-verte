import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  CursorPaginationBase,
  CursorPaginationResponseBase,
} from '../../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import {
  AdvantagePeriod,
  AdvantageType,
} from '../../../merchant/domain/entities/advantage.types'
import {
  TransactionEntity,
  TransactionProps,
} from '../../domain/entities/transaction.entity'
import {
  TransactionDeclinedReason,
  TransactionStatus,
} from '../../domain/entities/transaction.types'
import { TransactionTransferJoint } from '../../dtos/transaction.response.dto'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface TransactionRepositoryPort
  extends RepositoryPort<TransactionEntity, TransactionProps> {
  findManyByCardId(cardId: string): Promise<TransactionEntity[]>
  findManyByEmployeeId(employeeId: string): Promise<TransactionEntity[]>
  findManyByMerchantId(merchantId: string): Promise<TransactionEntity[]>
  findManyByExternalTransactionId(
    externalTransactionIds: string[],
  ): Promise<TransactionEntity[]>
  findOneByExternalTransactionIdOrThrow(
    externalTransactionId: string,
  ): Promise<TransactionEntity>
  exists(externalTransactionId: string): Promise<boolean>
  findAcceptedByExternalPaymentId(
    externalPaymentId: string,
  ): Promise<TransactionEntity | undefined>
  findDeclinedByExternalPaymentId(
    externalPaymentId: string,
  ): Promise<TransactionEntity | undefined>
  findOneByExternalPaymentId(
    externalPaymentId: string,
  ): Promise<TransactionEntity | undefined>
  findManyCursorPaginatedAndCount(
    employeeId: string,
    cursorPagination: CursorPaginationBase,
    startDate?: Date,
    status?: TransactionStatus[],
  ): Promise<CursorPaginationResponseBase<TransactionTransferJoint>>
  sumAmountForAdvantageOnPeriod(
    employeeId: string,
    advantage: AdvantageType,
    period: AdvantagePeriod,
  ): Promise<number | undefined>
  findManyPendingToBeExpired(
    daysToExpired: number,
    batch?: number,
  ): Promise<TransactionEntity[]>
  countPendingToBeExpired(daysToExpired: number): Promise<number>
  findManyByMidsAndPaymentDateAndStatus(
    mids: string[],
    paymentDate: Date,
    status: TransactionStatus,
  ): Promise<EmployeeByNewMerchant[]>
  findManyForRetroactiveCashback(
    mids: string[],
    paymentDate: Date,
  ): Promise<TransactionEntity[]>
  findIsExternalPaymentIdFirstDeclinedReasonTransaction(
    employeeId: string,
    externalPaymentId: string,
    declinedReason: TransactionDeclinedReason,
  ): Promise<boolean>
  findManyExternalUncaptured(batch?: number): Promise<TransactionEntity[]>
  employeeHasTransactionWithoutSucessfullPayin(
    employeeId: string,
  ): Promise<boolean>
}

export interface EmployeeByNewMerchant {
  employeeId: string
  merchantName: string
  paymentDate: Date
}
