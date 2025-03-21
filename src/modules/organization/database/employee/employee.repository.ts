import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindManyOptions,
  FindOptionsOrder,
  IsNull,
  LessThanOrEqual,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm'
import { logger } from '../../../../helpers/application.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import {
  DataWithPaginationMeta,
  OrderBy,
  QueryParams,
} from '../../../../libs/ddd/domain/ports/repository.ports'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import {
  TypeormRepositoryBase,
  WhereCondition,
} from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.repository.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { TWithStringKeys } from '../../../../libs/types/t-with-keys'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { TransferSource } from '../../../transaction/domain/entities/transfer.types'
import { UserOrmEntity } from '../../../user/database/user/user.orm-entity'
import {
  EmployeeEntity,
  EmployeeProps,
} from '../../domain/entities/employee.entity'
import { EmployeeStatus } from '../../domain/entities/employee.types'
import { BooleanByWeekday } from '../../domain/value-objects/boolean-by-weekday.value-object'
import { FindEmployeeResponseProps } from '../../dtos/employee.response.dto'
import { EmployeeOrmEntity } from './employee.orm-entity'
import { EmployeeOrmMapper } from './employee.orm-mapper'
import {
  EmployeeFirstnameReceiverCashbackElligibleQuery,
  EmployeeFirstnameReceiverNoPaymentMethodQuery,
  EmployeeFirstnameReceiverQuery,
  EmployeeFirstnameReceiverSumCashbackQuery,
  EmployeeFirstnameReceiverTransactionQuery,
  EmployeeRepositoryPort,
} from './employee.repository.port'

@Injectable()
export class EmployeeRepository
  extends TypeormRepositoryBase<
    EmployeeEntity,
    EmployeeProps,
    EmployeeOrmEntity
  >
  implements EmployeeRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(EmployeeOrmEntity)
    private readonly employeeRepository: Repository<EmployeeOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      employeeRepository,
      new EmployeeOrmMapper(EmployeeEntity, EmployeeOrmEntity, config),
      logger,
    )
  }

  private async findOneByUserIdOrm(
    userId: string,
  ): Promise<EmployeeOrmEntity | null> {
    const employee = await this.employeeRepository.findOne({
      where: { userId },
    })

    return employee
  }

  async findOneByUserId(userId: string): Promise<EmployeeEntity | undefined> {
    const employee = await this.findOneByUserIdOrm(userId)
    return employee ? this.mapper.toDomainEntity(employee) : undefined
  }

  async findOneByUserIdOrThrow(userId: string): Promise<EmployeeEntity> {
    const employee = await this.findOneByUserIdOrm(userId)
    if (!employee) {
      throw new NotFoundException(`Employee with userId '${userId}' not found`)
    }
    return this.mapper.toDomainEntity(employee)
  }

  async findManyByOrganizationIdAndEmails(
    organizationId: string,
    emails: string[],
  ): Promise<{ email: string; employeeId: string }[]> {
    const employees = await this.employeeRepository
      .createQueryBuilder()
      .select(['email', '"EmployeeOrmEntity"."id"'])
      .leftJoin(
        'receiver',
        'receiver',
        'receiver."userId" = "EmployeeOrmEntity"."userId"',
      )
      .where('receiver."email" = ANY(:emails)', {
        emails: emails,
      })
      .andWhere('"EmployeeOrmEntity"."organizationId" = :organizationId', {
        organizationId,
      })
      .getRawMany()

    return employees.map((employee) => {
      return { email: employee.email, employeeId: employee.id }
    })
  }

  private mapOneWithInfo(employee: TWithStringKeys): FindEmployeeResponseProps {
    return {
      id: new UUID(employee.id),
      createdAt: new DateVO(employee.createdAt),
      updatedAt: new DateVO(employee.updatedAt),
      city: employee.city,
      postalCode: employee.postalCode,
      street: employee.street,
      birthday: employee.birthday,
      userId: employee.userId,
      firstname: employee.firstname,
      lastname: employee.lastname,
      email: employee.email,
      mealTicketDays: new BooleanByWeekday(employee.mealTicketDays),
      mealTicketAmount: employee.mealTicketAmount,
      status: employee.activatedAt
        ? employee.hasPayed
          ? EmployeeStatus.EMPLOYEE_ACTIVE_MEAL_TICKET
          : EmployeeStatus.EMPLOYEE_ACTIVE
        : EmployeeStatus.EMPLOYEE_UNACTIVE,
    }
  }

  async findOneWithInfoByIdAndOrganizationIdOrThrow(
    employeeId: string,
    organizationId: string,
  ): Promise<FindEmployeeResponseProps> {
    const employee = await this.employeeInfoQuery()
      .where('"employee"."id" = :employeeId', {
        employeeId: employeeId,
      })
      .andWhere('"employee"."organizationId" = :organizationId', {
        organizationId: organizationId,
      })
      .limit(1)
      .getRawOne<TWithStringKeys>()

    if (!employee) {
      throw new NotFoundException(
        `Employee with employeeId '${employeeId}' not found`,
      )
    }

    return this.mapOneWithInfo(employee)
  }

  async findOneWithInfoByUserIdOrThrow(
    userId: string,
  ): Promise<FindEmployeeResponseProps> {
    const employee = await this.employeeInfoQuery()
      .where('"employee"."userId" = :userId', {
        userId: userId,
      })
      .limit(1)
      .getRawOne<TWithStringKeys>()

    if (!employee) {
      throw new NotFoundException(`Employee with userId '${userId}' not found`)
    }

    return this.mapOneWithInfo(employee)
  }

  async findOneWithInfoByIdOrThrow(
    employeeId: string,
  ): Promise<FindEmployeeResponseProps> {
    const employee = await this.employeeInfoQuery()
      .where('"employee"."id" = :employeeId', {
        employeeId: employeeId,
      })
      .limit(1)
      .getRawOne<TWithStringKeys>()

    if (!employee) {
      throw new NotFoundException(
        `Employee with employeeId '${employeeId}' not found`,
      )
    }

    return this.mapOneWithInfo(employee)
  }

  async findManyWithInfoById(
    employeeIds: string[],
  ): Promise<FindEmployeeResponseProps[]> {
    const employees = await this.employeeInfoQuery()
      .where('"employee"."id" = ANY(:employeeIds)', {
        employeeIds: employeeIds,
      })
      .getRawMany<TWithStringKeys>()

    return employees.map((employee) => this.mapOneWithInfo(employee))
  }

  async findAllWithInfoByOrganizationId(
    organizationId: string,
    avoidDeleted = false,
  ): Promise<FindEmployeeResponseProps[]> {
    const query = this.employeeInfoQuery().where(
      '"employee"."organizationId" = :organizationId',
      {
        organizationId: organizationId,
      },
    )
    if (avoidDeleted) query.andWhere('"employee"."willBeDeletedAt" IS NULL')

    const employees = await query.getRawMany<TWithStringKeys>()

    return employees.map((employee) => this.mapOneWithInfo(employee))
  }

  async findManyWithInfoByOrganizationId(
    organizationId: string,
    limit?: number,
    offset?: number,
    searchTerms?: string[],
  ): Promise<DataWithPaginationMeta<FindEmployeeResponseProps[]>> {
    const actualLimit = Math.max(
      Math.min(limit || 20, this.paginationLimitMax),
      1,
    )

    let query = this.employeeInfoQuery(searchTerms)
    query = query
      .andWhere('"employee"."organizationId" = :organizationId', {
        organizationId: organizationId,
      })
      .andWhere('"employee"."willBeDeletedAt" IS NULL')
      .limit(actualLimit)
      .offset(offset)

    if (searchTerms && searchTerms.length > 0) {
      searchTerms.forEach((term) => {
        if (!this.isEmail(term)) {
          query = query.orderBy(
            `GREATEST (simFirstname${term}, simLastname${term})`,
            'DESC',
            'NULLS LAST',
          )
        }
      })
    } else {
      query = query
        .orderBy('"user"."lastname"', 'ASC')
        .addOrderBy('"user"."firstname"', 'ASC')
        .addOrderBy('"user"."createdAt"', 'ASC')
    }

    const [rawRes, count] = await Promise.all([
      query.getRawMany<TWithStringKeys>(),
      query.getCount(),
    ])

    const result: DataWithPaginationMeta<FindEmployeeResponseProps[]> = {
      data: rawRes.map((item): FindEmployeeResponseProps => {
        return this.mapOneWithInfo(item)
      }),
      count: count,
      limit: limit,
    }
    return result
  }

  private buildSelectAndWhereRequests(searchTerms: string[], minScore: number) {
    let whereRequest: string[] = []
    let selectRequest = [
      'user.id "id"',
      'user.firstname "firstname"',
      'user.lastname "lastname"',
    ]

    let tmpWhereRequest = '('
    /* Creating a select request for the similarity of the first name and last name */
    searchTerms.forEach((term, idx, array) => {
      if (this.isEmail(term)) {
        tmpWhereRequest += `receiver.email LIKE '%${term}%'`
      } else {
        selectRequest.push(
          `COALESCE(SIMILARITY(unaccent(LOWER(translate(user.firstname, ' ,-''', ''))), unaccent('${term}')), 0) AS simFirstname${term}`,
        )
        selectRequest.push(
          `COALESCE(SIMILARITY(unaccent(LOWER(translate(user.lastname, ' ,-''', ''))), unaccent('${term}')), 0) AS simLastname${term}`,
        )

        /* Creating a query to search for users with a name similar to the one provided. */
        tmpWhereRequest += `
                (
                    simFirstname${term} > ${minScore} OR
                    simLastname${term} > ${minScore}
                )
            `
      }

      if (idx != array.length - 1) {
        tmpWhereRequest += ' AND '
      }
    })
    tmpWhereRequest += ')'
    whereRequest.push(tmpWhereRequest)
    return { selectRequest, whereRequest }
  }

  private isEmail(term: string): boolean {
    return term.includes('@') || term.includes('.')
  }

  private employeeInfoQuery(
    searchTerms?: string[],
  ): SelectQueryBuilder<EmployeeOrmEntity> {
    const minScore = 0.35
    let selectRequest: string[] = []
    let whereRequest: string[] = []

    if (searchTerms) {
      ;({ selectRequest, whereRequest } = this.buildSelectAndWhereRequests(
        searchTerms,
        minScore,
      ))
    }

    let queryBuilder = this.repository
      .createQueryBuilder('employee')
      .select([
        'employee.id "id"',
        'employee.createdAt "createdAt"',
        'employee.updatedAt "updatedAt"',
        'employee.userId "userId"',
        'employee.mealTicketDays "mealTicketDays"',
        'employee.birthday "birthday"',
        'employee.activatedAt "activatedAt"',
        'receiver.email "email"',
        'organization.city "city"',
        'organization.street "street"',
        'organization.postalCode "postalCode"',
        'organization.coveragePercent "coveragePercent"',
        'organization.mealTicketAmount "mealTicketAmount"',
      ])
      .leftJoin(
        'receiver',
        'receiver',
        '"employee"."userId" = "receiver"."userId"',
      )
      .leftJoin(
        'organization',
        'organization',
        '"employee"."organizationId" = "organization"."id"',
      )
      .addSelect((subQuery) => {
        return subQuery
          .select(
            'CASE WHEN COUNT(transaction.id) > 0 THEN TRUE ELSE FALSE END',
            'hasPayed',
          )
          .from('transaction', 'transaction')
          .where('"transaction"."employeeId" = "employee"."id"')
      }, 'hasPayed')
    if (searchTerms) {
      queryBuilder = queryBuilder
        .leftJoinAndSelect(
          (qb) => qb.select(selectRequest).from(UserOrmEntity, 'user'),
          'user',
          '"user"."id" = employee."userId"',
        )
        .where(whereRequest.join(' AND '))
    } else {
      queryBuilder = queryBuilder
        .leftJoin('user', 'user', '"user"."id" = employee."userId"')
        .addSelect(['user.firstname "firstname"', 'user.lastname "lastname"'])
    }

    return queryBuilder
  }

  private getEmployeesToBeDeletedWhere(
    lessThanDate: Date,
  ): FindManyOptions<EmployeeOrmEntity> {
    return {
      where: {
        willBeDeletedAt: LessThanOrEqual(lessThanDate),
      },
    }
  }

  async employeesToBeDeletedCount(lessThanDate: Date): Promise<number> {
    return this.repository.count(
      this.getEmployeesToBeDeletedWhere(lessThanDate),
    )
  }

  async employeesToBeDeleted(
    lessThanDate: Date,
    batchSize: number = 5000,
  ): Promise<EmployeeEntity[]> {
    const employees = await this.repository.find({
      ...this.getEmployeesToBeDeletedWhere(lessThanDate),
      take: batchSize,
    })
    return employees.map((employee) => this.mapper.toDomainEntity(employee))
  }

  async exists(userId: string): Promise<boolean> {
    const found = await this.findOneByUserId(userId)
    if (found) {
      return true
    }
    return false
  }

  private getEmployeeNotActivatedWhere(
    sub: SelectQueryBuilder<any>,
    dayCount: number,
  ): SelectQueryBuilder<any> {
    return sub
      .select('employee."userId"')
      .from('employee', 'employee')
      .leftJoin('wallet', 'wallet', 'wallet."employeeId" = employee."id"')
      .leftJoin('transfer', 'transfer', 'transfer."walletId" = wallet."id"')
      .where(`employee."activatedAt" IS NULL`)
      .groupBy('employee."userId"')
      .having('current_date - MIN(transfer."paymentDate")::date = :dayCount', {
        dayCount,
      })
  }

  async employeeNotActivatedCount(dayCount: number): Promise<number> {
    const count = await this.repository.manager
      .createQueryBuilder()
      .select('COUNT("employeeCount"."userId") AS "count"')
      .from(
        (sub: SelectQueryBuilder<any>) =>
          this.getEmployeeNotActivatedWhere(sub, dayCount),
        'employeeCount',
      )
      .limit(1)
      .getRawOne<{ count: number }>()
    return count ? count.count : 0
  }

  async employeeNotActivatedReceiverIds(
    dayCount: number,
    skip?: number,
    batchSize?: number,
  ): Promise<string[]> {
    const employees = await this.getEmployeeNotActivatedWhere(
      this.repository.manager.createQueryBuilder(),
      dayCount,
    )
      .leftJoin(
        'receiver',
        'receiver',
        '"receiver"."userId" = employee."userId"',
      )
      .select('receiver.id "receiverId"')
      .addGroupBy('receiver.id')
      .take(batchSize)
      .skip(skip)
      .getRawMany()
    return employees.map((employee: any) => employee.receiverId)
  }

  private getEmployeeActivatedSinceWhere(
    sub: SelectQueryBuilder<any>,
    dayCount: number[],
  ): SelectQueryBuilder<any> {
    return sub
      .select('employee."userId"')
      .from('employee', 'employee')
      .where(`current_date - employee."activatedAt"::date = ANY(:dayCount)`, {
        dayCount,
      })
  }

  async employeeActivatedSinceCount(dayCount: number[]): Promise<number> {
    return this.getEmployeeActivatedSinceWhere(
      this.repository.manager.createQueryBuilder(),
      dayCount,
    ).getCount()
  }

  async employeeActivatedSince(
    dayCount: number[],
    skip?: number,
    batchSize: number = 5000,
  ): Promise<EmployeeFirstnameReceiverCashbackElligibleQuery[]> {
    const employees = await this.getEmployeeActivatedSinceWhere(
      this.repository.manager.createQueryBuilder(),
      dayCount,
    )
      .leftJoin('user', 'user', '"user".id = employee."userId"')
      .leftJoin(
        'receiver',
        'receiver',
        '"receiver"."userId" = employee."userId"',
      )
      .leftJoin(
        'organization',
        'organization',
        'organization."id" = employee."organizationId"',
      )
      .select(['"user".firstname "firstname"', 'receiver.id "receiverId"'])
      .addSelect(`current_date - employee."activatedAt"::date`, 'daySince')
      .addSelect('organization."advantageInShops" > 0', 'isCashbackElligible')
      .take(batchSize)
      .skip(skip)
      .getRawMany()
    return employees.map((employee: any) => {
      return {
        firstname: employee.firstname,
        receiverId: employee.receiverId,
        isCashbackElligible: employee.isCashbackElligible,
        daySince: employee.daySince,
      }
    })
  }

  async employeeSinceActivatedHasNoTransaction(
    dayCount: number,
    skip?: number,
    batchSize: number = 5000,
  ): Promise<EmployeeFirstnameReceiverTransactionQuery[]> {
    const employees = await this.employeeFirstnameReceiverJoinAndSelect(
      this.getEmployeeActivatedSinceWhere(
        this.repository.manager.createQueryBuilder(),
        [dayCount],
      ),
    )
      .leftJoin(
        'transaction',
        'transaction',
        'transaction."employeeId" = employee."id"',
      )
      .addSelect(['COUNT(transaction.id) <> 0 "hasTransaction"'])
      .leftJoin(
        'organization',
        'organization',
        'organization."id" = employee."organizationId"',
      )
      .having(
        'organization."advantageInShops" <> 0 OR COUNT(transaction.id) = 0',
      )
      .leftJoin(
        'wallet',
        'wallet',
        'wallet."employeeId" = employee.id AND wallet.advantage = :type',
        { type: AdvantageType.MEALTICKET },
      )
      .andHaving('wallet."balance" > 0')
      .addGroupBy('organization."advantageInShops", wallet."balance"')
      .take(batchSize)
      .skip(skip)
      .getRawMany()
    return employees.map((employee: any) => {
      return {
        firstname: employee.firstname,
        receiverId: employee.receiverId,
        hasTransaction: employee.hasTransaction,
      }
    })
  }

  getEmployeeSinceActivatedHasNoPaymentMethodWhere(
    sub: SelectQueryBuilder<any>,
    dayCount: number[],
  ): SelectQueryBuilder<any> {
    return sub
      .from('employee', 'employee')
      .leftJoin(
        'wallet',
        'wallet',
        `wallet."employeeId" = employee."id" AND wallet.advantage = 'MEALTICKET'`,
      )
      .leftJoin('card', 'card', 'card."employeeId" = employee."id"')
      .leftJoin('transfer', 'transfer', 'transfer."walletId" = wallet."id"')
      .where(
        `source = 'MEAL_TICKET_CREDIT' AND (card.id IS NULL OR (card."convertedToPhysicalAt" IS NULL AND card."cardDigitalizations" = '[]'))`,
      )
      .groupBy(
        `LEAST("paymentDate"), employee.id, employee."activatedAt", card."convertedToPhysicalAt", card."cardDigitalizations"`,
      )
      .having(
        `current_date - GREATEST (employee."activatedAt"::date, LEAST("paymentDate")::date) = ANY(:dayCount)`,
        { dayCount },
      )
      .andHaving(
        `LEAST("paymentDate") IS NOT NULL AND employee."activatedAt" IS NOT NULL`,
      )
  }

  async employeeSinceActivatedHasNoPaymentMethodCount(
    dayCount: number[],
  ): Promise<number> {
    const count = await this.repository.manager
      .createQueryBuilder()
      .select('COUNT("employeeCount"."employeeId") AS "count"')
      .from(
        (sub: SelectQueryBuilder<any>) =>
          this.getEmployeeSinceActivatedHasNoPaymentMethodWhere(
            sub,
            dayCount,
          ).select('employee.id "employeeId"'),
        'employeeCount',
      )
      .limit(1)
      .getRawOne<{ count: number }>()
    return count ? count.count : 0
  }

  async employeeSinceActivatedHasNoPaymentMethod(
    dayCount: number[],
    skip?: number,
    batchSize: number = 5000,
  ): Promise<EmployeeFirstnameReceiverNoPaymentMethodQuery[]> {
    const employees = await this.employeeFirstnameReceiverJoinAndSelect(
      this.getEmployeeSinceActivatedHasNoPaymentMethodWhere(
        this.repository.manager.createQueryBuilder(),
        dayCount,
      ),
    )
      .addSelect(
        `current_date - GREATEST (employee."activatedAt"::date, LEAST("paymentDate")::date)`,
        'daySince',
      )
      .take(batchSize)
      .skip(skip)
      .getRawMany()
    return employees.map((employee: any) => {
      return {
        firstname: employee.firstname,
        receiverId: employee.receiverId,
        daySince: employee.daySince,
      }
    })
  }

  private getEmployeeSumCashbackSinceWhere(
    sub: SelectQueryBuilder<any>,
    createdAfter?: Date,
  ): SelectQueryBuilder<any> {
    const query = sub
      .select('employee."userId"')
      .from('employee', 'employee')
      .leftJoin('wallet', 'wallet', 'wallet."employeeId" = employee."id"')
      .leftJoin('transfer', 'transfer', 'transfer."walletId" = wallet."id"')
      .leftJoin(
        'organization',
        'organization',
        'organization."id" = employee."organizationId"',
      )
      .where('organization."advantageInShops" <> 0')
      .andWhere('transfer.source = :source', {
        source: TransferSource.CASHBACK,
      })
      .groupBy('employee."userId"')
    if (createdAfter) {
      return query.andWhere(`transfer."paymentDate" > :createdAfter`, {
        createdAfter,
      })
    }
    return query
  }

  async employeeSumCashbackSinceCount(createdAfter: Date): Promise<number> {
    return this.getEmployeeSumCashbackSinceWhere(
      this.repository.manager.createQueryBuilder(),
      createdAfter,
    )
      .having('SUM(transfer.amount) > 0')
      .getCount()
  }

  async employeeSumCashbackSince(
    createdAfter: Date,
    skip?: number,
    batchSize: number = 5000,
  ): Promise<EmployeeFirstnameReceiverSumCashbackQuery[]> {
    const employees = await this.employeeFirstnameReceiverJoinAndSelect(
      this.getEmployeeSumCashbackSinceWhere(
        this.repository.manager.createQueryBuilder(),
        createdAfter,
      ),
    )
      .addSelect([
        `SUM(CASE WHEN transfer."paymentDate" > '${createdAfter.toISOString()}' THEN amount ELSE 0 END) "cashbackAmount"`,
      ])
      .addSelect(['SUM(transfer.amount) "cashbackAmountYear"'])
      .where(
        `transfer."paymentDate" > DATE_TRUNC('year', NOW()) - INTERVAL '1 year'`,
      )
      .andWhere('transfer.source = :source', {
        source: TransferSource.CASHBACK,
      })
      .having(
        `SUM(CASE WHEN transfer."paymentDate" > '${createdAfter.toISOString()}' THEN 1 ELSE 0 END) > 0`,
      )
      .take(batchSize)
      .skip(skip)
      .getRawMany()
    return employees.map((employee: any) => {
      return {
        firstname: employee.firstname,
        receiverId: employee.receiverId,
        cashbackAmount: Number(employee.cashbackAmount),
        cashbackAmountYear: Number(employee.cashbackAmountYear),
      }
    })
  }

  async employeeSumCashback(
    employeeId: string,
    createdAfter?: Date,
  ): Promise<number> {
    const query = this.employeeFirstnameReceiverJoinAndSelect(
      this.getEmployeeSumCashbackSinceWhere(
        this.repository.manager.createQueryBuilder(),
      ),
    )
      .select(['SUM(transfer.amount) "cashbackAmount"'])
      .andWhere('employee.id = :employeeId', {
        employeeId: employeeId,
      })
    if (createdAfter) {
      query.andWhere(`transfer."paymentDate" > :createdAfter`, {
        createdAfter,
      })
    }
    const employee = await query.limit(1).getRawOne()
    return Number(employee?.cashbackAmount ? employee.cashbackAmount : 0)
  }

  private getEmployeeSinceActivatedHasNoCashbackWhere(
    sub: SelectQueryBuilder<any>,
    dayCount: number,
  ): SelectQueryBuilder<any> {
    return this.getEmployeeActivatedSinceWhere(sub, [dayCount])
      .leftJoin('wallet', 'wallet', 'wallet."employeeId" = employee."id"')
      .leftJoin(
        'organization',
        'organization',
        'organization."id" = employee."organizationId"',
      )
      .andWhere('organization."advantageInShops" <> 0')
      .andWhere('wallet."createdAt" = wallet."updatedAt"')
      .andWhere('wallet.advantage = :advantage', {
        advantage: AdvantageType.NONE,
      })
  }

  async employeeSinceActivatedHasNoCashbackCount(
    dayCount: number,
  ): Promise<number> {
    return this.getEmployeeSinceActivatedHasNoCashbackWhere(
      this.repository.manager.createQueryBuilder(),
      dayCount,
    ).getCount()
  }

  async employeeSinceActivatedHasNoCashback(
    dayCount: number,
    skip?: number,
    batchSize: number = 5000,
  ): Promise<EmployeeFirstnameReceiverQuery[]> {
    const employees = await this.employeeFirstnameReceiverJoinAndSelect(
      this.getEmployeeSinceActivatedHasNoCashbackWhere(
        this.repository.manager.createQueryBuilder(),
        dayCount,
      ),
    )
      .take(batchSize)
      .skip(skip)
      .getRawMany()
    return employees.map((employee: any) => {
      return {
        firstname: employee.firstname,
        receiverId: employee.receiverId,
      }
    })
  }

  private employeeFirstnameReceiverJoinAndSelect(sub: SelectQueryBuilder<any>) {
    return sub
      .select(['"user".firstname "firstname"', 'receiver.id "receiverId"'])
      .leftJoin('user', 'user', '"user".id = employee."userId"')
      .leftJoin(
        'receiver',
        'receiver',
        '"receiver"."userId" = employee."userId"',
      )
      .addGroupBy('"user".firstname')
      .addGroupBy('receiver.id')
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<EmployeeProps>,
  ): FindOptionsOrder<EmployeeOrmEntity> {
    const order: FindOptionsOrder<EmployeeOrmEntity> = {}
    if (isUndefined(params)) {
      return order
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<EmployeeProps>,
  ): WhereCondition<EmployeeOrmEntity> {
    const where: WhereCondition<EmployeeOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.userId) {
      where.userId = params.userId.value
    }
    if (params.organizationId) {
      where.organizationId = params.organizationId.value
    }
    if (params.willBeDeletedAt) {
      where.willBeDeletedAt = params.willBeDeletedAt.value
    }
    return where
  }

  async employeeActivatedCount(): Promise<number> {
    return this.repository.count({
      where: {
        activatedAt: Not(IsNull()),
      },
    })
  }

  async employeeActivatedReceiverIds(
    skip?: number,
    batchSize?: number,
  ): Promise<string[]> {
    const employees = await this.repository
      .createQueryBuilder('employee')
      .select('receiver.id', 'receiverId')
      .leftJoin('receiver', 'receiver', 'receiver."userId" = employee."userId"')
      .where('employee."activatedAt" IS NOT NULL')
      .skip(skip)
      .take(batchSize)
      .getRawMany()

    return employees.map((employee) => employee.receiverId)
  }
}
