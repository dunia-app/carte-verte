import {
  DataWithPaginationMeta,
  RepositoryPort,
} from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  EmployeeEntity,
  EmployeeProps,
} from '../../domain/entities/employee.entity'
import { FindEmployeeResponseProps } from '../../dtos/employee.response.dto'

export interface EmployeeFirstnameReceiverQuery {
  firstname: string
  receiverId: string
}
export interface EmployeeFirstnameReceiverCashbackElligibleQuery
  extends EmployeeFirstnameReceiverQuery {
  daySince: number
  isCashbackElligible: boolean
}
export interface EmployeeFirstnameReceiverTransactionQuery
  extends EmployeeFirstnameReceiverQuery {
  hasTransaction: boolean
}
export interface EmployeeFirstnameReceiverCashbackQuery
  extends EmployeeFirstnameReceiverQuery {
  hasCashback: boolean
}
export interface EmployeeFirstnameReceiverSumCashbackQuery
  extends EmployeeFirstnameReceiverQuery {
  cashbackAmount: number
  cashbackAmountYear: number
}
export interface EmployeeFirstnameReceiverNoPaymentMethodQuery
  extends EmployeeFirstnameReceiverQuery {
  daySince: number
}

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface EmployeeRepositoryPort
  extends RepositoryPort<EmployeeEntity, EmployeeProps> {
  findOneByUserId(userId: string): Promise<EmployeeEntity | undefined>
  findOneByUserIdOrThrow(userId: string): Promise<EmployeeEntity>
  findOneWithInfoByUserIdOrThrow(
    userId: string,
  ): Promise<FindEmployeeResponseProps>
  findOneWithInfoByIdOrThrow(
    employeeId: string,
  ): Promise<FindEmployeeResponseProps>
  findOneWithInfoByIdAndOrganizationIdOrThrow(
    employeeId: string,
    organizationId: string,
  ): Promise<FindEmployeeResponseProps>
  findManyWithInfoByOrganizationId(
    organizationId: string,
    limit?: number,
    offset?: number,
    searchTerms?: string[],
  ): Promise<DataWithPaginationMeta<FindEmployeeResponseProps[]>>
  findAllWithInfoByOrganizationId(
    organizationId: string,
    avoidDeleted?: boolean,
  ): Promise<FindEmployeeResponseProps[]>
  findManyByOrganizationIdAndEmails(
    organizationId: string,
    emails: string[],
  ): Promise<{ email: string; employeeId: string }[]>
  employeesToBeDeletedCount(lessThanDate: Date): Promise<number>
  employeesToBeDeleted(
    lessThanDate: Date,
    batchSize: number,
  ): Promise<EmployeeEntity[]>
  exists(userId: string): Promise<boolean>
  employeeNotActivatedCount(dayCount: number): Promise<number>
  employeeNotActivatedReceiverIds(
    dayCount: number,
    skip?: number,
    batchSize?: number,
  ): Promise<string[]>
  employeeActivatedCount(): Promise<number>
  employeeActivatedReceiverIds(
    skip?: number,
    batchSize?: number,
  ): Promise<string[]>
  employeeActivatedSinceCount(dayCount: number[]): Promise<number>
  employeeActivatedSince(
    dayCount: number[],
    skip?: number,
    batchSize?: number,
  ): Promise<EmployeeFirstnameReceiverCashbackElligibleQuery[]>
  employeeSinceActivatedHasNoTransaction(
    dayCount: number,
    skip?: number,
    batchSize?: number,
  ): Promise<EmployeeFirstnameReceiverTransactionQuery[]>
  employeeSumCashbackSinceCount(createdAfter: Date): Promise<number>
  employeeSumCashbackSince(
    createdAfter: Date,
    skip?: number,
    batchSize?: number,
  ): Promise<EmployeeFirstnameReceiverSumCashbackQuery[]>
  employeeSinceActivatedHasNoCashbackCount(dayCount: number): Promise<number>
  employeeSinceActivatedHasNoCashback(
    dayCount: number,
    skip?: number,
    batchSize?: number,
  ): Promise<EmployeeFirstnameReceiverQuery[]>
  employeeSinceActivatedHasNoPaymentMethodCount(
    dayCount: number[],
  ): Promise<number>
  employeeSinceActivatedHasNoPaymentMethod(
    dayCount: number[],
    skip?: number,
    batchSize?: number,
  ): Promise<EmployeeFirstnameReceiverNoPaymentMethodQuery[]>
}
