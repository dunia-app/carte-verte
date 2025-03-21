import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindOptionsOrder,
  In,
  IsNull,
  LessThan,
  Like,
  MoreThan,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm'
import { logger } from '../../../../helpers/application.helper'
import {
  CursorDirection,
  OrderName,
  buildCursorsFromItems,
  fromBase64,
} from '../../../../helpers/cursor.helper'
import { union } from '../../../../helpers/query.helper'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import {
  OrderBy,
  QueryParams,
} from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  TypeormRepositoryBase,
  WhereCondition,
} from '../../../../libs/ddd/infrastructure/database/base-classes/typeorm.repository.base'
import {
  CursorPaginationBase,
  CursorPaginationResponseBase,
} from '../../../../libs/ddd/interface-adapters/base-classes/pagination.base'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import {
  TransactionEntity,
  TransactionProps,
} from '../../../../modules/transaction/domain/entities/transaction.entity'
import {
  AdvantagePeriod,
  AdvantageType,
} from '../../../merchant/domain/entities/advantage.types'
import {
  TransactionDeclinedReason,
  TransactionStatus,
  defaultTransactionStatusToDisplay,
} from '../../domain/entities/transaction.types'
import {
  TransferDirection,
  TransferSource,
  getIconUrlTransferSource,
} from '../../domain/entities/transfer.types'
import {
  TransactionTranferJointProps,
  TransactionTransferJoint,
} from '../../dtos/transaction.response.dto'
import { TransactionOrmEntity } from './transaction.orm-entity'
import { TransactionOrmMapper } from './transaction.orm-mapper'
import {
  EmployeeByNewMerchant,
  TransactionRepositoryPort,
} from './transaction.repository.port'
import moment = require('moment')

@Injectable()
export class TransactionRepository
  extends TypeormRepositoryBase<
    TransactionEntity,
    TransactionProps,
    TransactionOrmEntity
  >
  implements TransactionRepositoryPort
{
  protected relations: string[] = []

  constructor(
    @InjectRepository(TransactionOrmEntity)
    private readonly transactionRepository: Repository<TransactionOrmEntity>,
    protected readonly config: ConfigService,
  ) {
    super(
      transactionRepository,
      new TransactionOrmMapper(TransactionEntity, TransactionOrmEntity, config),
      logger,
    )
  }

  async findManyByEmployeeId(employeeId: string): Promise<TransactionEntity[]> {
    const transactions = await this.transactionRepository.find({
      where: { employeeId },
    })
    return transactions.map((transaction) =>
      this.mapper.toDomainEntity(transaction),
    )
  }

  async findManyByCardId(cardId: string): Promise<TransactionEntity[]> {
    const transactions = await this.transactionRepository.find({
      where: { cardId },
    })
    return transactions.map((transaction) =>
      this.mapper.toDomainEntity(transaction),
    )
  }

  async findManyByMerchantId(merchantId: string): Promise<TransactionEntity[]> {
    const transactions = await this.transactionRepository.find({
      where: { merchantId },
    })
    return transactions.map((transaction) =>
      this.mapper.toDomainEntity(transaction),
    )
  }

  async findManyByExternalTransactionId(
    externalTransactionIds: string[],
  ): Promise<TransactionEntity[]> {
    const transactions = await this.transactionRepository.find({
      where: { externalTransactionId: In(externalTransactionIds) },
    })
    return transactions.map((transaction) =>
      this.mapper.toDomainEntity(transaction),
    )
  }

  countPendingToBeExpired(daysToExpired: number): Promise<number> {
    const dateToBeExpired = moment().subtract(daysToExpired, 'day').toDate()
    return this.getAcceptedPendingTransactionsQuery(dateToBeExpired).getCount()
  }

  async findManyPendingToBeExpired(
    daysToExpired: number,
    batch: number = 5000,
  ): Promise<TransactionEntity[]> {
    const dateToBeExpired = moment().subtract(daysToExpired, 'day').toDate()
    const transactions = await this.getAcceptedPendingTransactionsQuery(
      dateToBeExpired,
    )
      .take(batch)
      .getMany()
    return transactions.map((transaction) =>
      this.mapper.toDomainEntity(transaction),
    )
  }

  async findOneByExternalPaymentId(
    externalPaymentId: string,
  ): Promise<TransactionEntity | undefined> {
    const transaction = await this.transactionRepository.findOne({
      where: { externalPaymentId },
      relations: [...this.relations],
    })

    return transaction ? this.mapper.toDomainEntity(transaction) : undefined
  }

  private async findOneByExternalTransactionId(
    externalTransactionId: string,
    relations: string[] = this.relations,
  ): Promise<TransactionOrmEntity | null> {
    const transaction = await this.transactionRepository.findOne({
      where: { externalTransactionId },
      relations: [...relations],
    })

    return transaction
  }

  async findOneByExternalTransactionIdOrThrow(
    externalTransactionId: string,
  ): Promise<TransactionEntity> {
    const transaction = await this.findOneByExternalTransactionId(
      externalTransactionId,
    )
    if (!transaction) {
      throw new NotFoundException(
        `Transaction with externalTransactionId '${externalTransactionId}' not found`,
      )
    }
    return this.mapper.toDomainEntity(transaction)
  }

  async exists(externalTransactionId: string): Promise<boolean> {
    const found = await this.findOneByExternalTransactionId(
      externalTransactionId,
    )
    if (found) {
      return true
    }
    return false
  }

  async findManyByMidsAndPaymentDateAndStatus(
    merchantMerchantOrganizationIds: string[],
    paymentDate: Date,
    status: TransactionStatus,
  ): Promise<EmployeeByNewMerchant[]> {
    const transactions = (await this.repository.manager
      .createQueryBuilder()
      .select([
        '"transaction"."employeeId" "employeeId"',
        'COALESCE("merchant_organization"."brandName", "transaction"."merchantName") "merchantName"',
        'MAX("transaction"."paymentDate") "paymentDate"',
      ])
      .from('merchant_merchant_organization', 'merchant_merchant_organization')
      .leftJoin(
        'transaction',
        'transaction',
        'transaction."merchantId" = "merchant_merchant_organization".mid AND CASE WHEN EXISTS (SELECT 1 FROM payment_solution WHERE LOWER("transaction"."merchantName") LIKE \'%\' || LOWER(payment_solution.name) || \'%\') THEN ("transaction"."merchantName" = "merchant_merchant_organization"."merchantName") ELSE (TRUE) END',
      )
      .leftJoin(
        'merchant_organization',
        'merchant_organization',
        'merchant_organization.siret = "merchant_merchant_organization".siret',
      )
      .where(
        '"merchant_merchant_organization"."id" = ANY(:merchantMerchantOrganizationIds)',
        { merchantMerchantOrganizationIds },
      )
      .andWhere('"transaction"."paymentDate" > :paymentDate', {
        paymentDate: paymentDate,
      })
      .andWhere('"transaction"."status" = :status', {
        status,
      })
      .andWhere(
        '("transaction"."declinedReason" IS NULL OR "transaction"."declinedReason" = :declinedReason)',
        {
          declinedReason: TransactionDeclinedReason.MERCHANT_INVALID,
        },
      )
      .groupBy(
        '"transaction"."employeeId", COALESCE("merchant_organization"."brandName", "transaction"."merchantName")',
      )
      .getRawMany()) as EmployeeByNewMerchant[]
    return transactions
  }

  async findManyForRetroactiveCashback(
    mids: string[],
    paymentDate: Date,
  ): Promise<TransactionEntity[]> {
    const transactions = await this.repository.find({
      where: {
        merchantId: In(mids),
        paymentDate: MoreThan(paymentDate),
        status: TransactionStatus.Accepted,
        amount: LessThan(0),
        cashbackId: IsNull(),
      },
    })
    return transactions.map((transaction) =>
      this.mapper.toDomainEntity(transaction),
    )
  }

  async findAcceptedByExternalPaymentId(
    externalPaymentId: string,
  ): Promise<TransactionEntity | undefined> {
    const transaction = await this.transactionRepository.findOne({
      where: { externalPaymentId, status: TransactionStatus.Accepted },
    })
    if (!transaction) {
      return undefined
    }
    return this.mapper.toDomainEntity(transaction)
  }

  async findDeclinedByExternalPaymentId(
    externalPaymentId: string,
  ): Promise<TransactionEntity | undefined> {
    const transaction = await this.transactionRepository.findOne({
      where: { externalPaymentId, status: TransactionStatus.Declined },
    })
    if (!transaction) {
      return undefined
    }
    return this.mapper.toDomainEntity(transaction)
  }

  async findIsExternalPaymentIdFirstDeclinedReasonTransaction(
    employeeId: string,
    externalPaymentId: string,
    declinedReason: TransactionDeclinedReason,
  ): Promise<boolean> {
    const transaction = await this.transactionRepository.find({
      where: {
        employeeId: employeeId,
        externalPaymentId: Not(externalPaymentId),
        status: TransactionStatus.Declined,
        declinedReason: declinedReason,
      },
    })
    if (transaction.length === 0) {
      return true
    }
    return false
  }

  async findIsExternalPaymentIdFirstMerchantTransaction(
    employeeId: string,
    externalPaymentId: string,
    merchantNameLike: string,
  ): Promise<boolean> {
    const transaction = await this.transactionRepository.find({
      where: {
        employeeId: employeeId,
        externalPaymentId: Not(externalPaymentId),
        status: TransactionStatus.Declined,
        merchantName: Like(merchantNameLike),
      },
    })
    if (transaction.length === 0) {
      return true
    }
    return false
  }

  async findManyCursorPaginatedAndCount(
    employeeId: string,
    cursorPagination: CursorPaginationBase,
    startDate?: Date,
    status: TransactionStatus[] = defaultTransactionStatusToDisplay,
  ): Promise<CursorPaginationResponseBase<TransactionTransferJoint>> {
    const unionTableName = 'jointTransaction'
    const cursorRowName = `"${unionTableName}"."paymentDate"`
    let query = this.findTransactionTransferJoint(
      unionTableName,
      employeeId,
      startDate,
      status,
    ).orderBy(cursorRowName, 'DESC')

    let paginateOrder: OrderName = 'DESC'
    let filterValue: string
    let filter: string | undefined = undefined
    if (cursorPagination.cursor) {
      const decoded = fromBase64(cursorPagination.cursor)
      const [dirSign, value] = decoded.split(';')
      if (dirSign && value) {
        filterValue = value
        paginateOrder = dirSign === CursorDirection.BEFORE ? 'ASC' : 'DESC'
        filter =
          dirSign === CursorDirection.BEFORE
            ? `${cursorRowName} > :filterValue`
            : `${cursorRowName} < :filterValue`
        query = query
          .where(filter, { filterValue })
          .orderBy(cursorRowName, paginateOrder)
      }
    }
    const actualLimit = Math.max(Math.min(cursorPagination.limit || 20, 500), 1)

    const [transactions, count] = (await Promise.all([
      query.clone().take(actualLimit).getRawMany(),
      // because we use a custom union function to replace typeorm nonexisting one (in findTransactionTransferJoint)
      // .getCount() does not work so we use this select instead
      query.select('COUNT(*)').orderBy().limit(1).getRawOne(),
    ])) as [TransactionTranferJointProps[], { count: number }]

    const sortedTransaction = transactions.sort(
      (a, b) => b.paymentDate.getTime() - a.paymentDate.getTime(),
    )

    const cursor = await buildCursorsFromItems(
      sortedTransaction,
      this.hasCursorDirectionHandler(employeeId, CursorDirection.BEFORE),
      this.hasCursorDirectionHandler(employeeId, CursorDirection.AFTER),
      'paymentDate',
    )

    return {
      data: sortedTransaction.map((tr) => new TransactionTransferJoint(tr)),
      count: count.count,
      before: cursor.before,
      after: cursor.after,
    }
  }

  private hasCursorDirectionHandler(
    employeeId: string,
    cursorDir: CursorDirection,
  ) {
    return async (date: any) => {
      const result = await this.repository.findOne({
        where: {
          employeeId: employeeId,
          expiredAt: IsNull(),
          amount: Not(0),
          paymentDate:
            cursorDir === CursorDirection.BEFORE
              ? MoreThan(date)
              : LessThan(date),
        },
        select: ['id'],
      })
      return !!result
    }
  }

  async sumAmountForAdvantageOnPeriod(
    employeeId: string,
    advantage: AdvantageType,
    period: AdvantagePeriod,
  ): Promise<number | undefined> {
    // TO DO : make that it works for all advantage
    // for the moment we only make it for MEALTICKET
    if (advantage !== AdvantageType.MEALTICKET) {
      return undefined
    }
    const periodString =
      period === AdvantagePeriod.DAILY
        ? 'day'
        : period === AdvantagePeriod.MONTHLY
        ? 'month'
        : period === AdvantagePeriod.YEARLY
        ? 'year'
        : undefined
    const sum = await this.repository
      .createQueryBuilder('transaction')
      .select(
        `SUM(CASE WHEN status = '${TransactionStatus.Accepted}' THEN amount ELSE -amount END)`,
      )
      .where(`"employeeId" = :employeeId`, { employeeId })
      .andWhere(
        `date_trunc(:periodString, "paymentDate") = date_trunc(:periodString, CURRENT_DATE)`,
        {
          periodString,
        },
      )
      .andWhere('status = ANY(:status)', {
        status: [TransactionStatus.Accepted, TransactionStatus.Reversed],
      })
      .andWhere('amount < 0')
      .andWhere(
        `NOT exists(select 1 from "transaction" "tr" where tr."externalPaymentId"="transaction"."externalPaymentId" AND tr.status= :declinedStatus)`,
        { declinedStatus: TransactionStatus.Declined },
      )
      .groupBy(`date_trunc('${periodString}', "paymentDate")`)
      .limit(1)
      .getRawOne()
    return isUndefined(sum) ? undefined : sum.sum
  }

  async findManyExternalUncaptured(
    batch?: number,
  ): Promise<TransactionEntity[]> {
    const transactions = await this.repository
      .createQueryBuilder('transaction')
      .where(
        `"transaction".status='Settled' AND "transaction"."advantageRepartition" ->> 'EXTERNAL' IS NOT NULL`,
      )
      .andWhere(`"transaction"."employeeId" IS NOT NULL`)
      .andWhere(
        `NOT EXISTS (SELECT 1 FROM card_acquisition_payin WHERE "transaction"."externalPaymentId" = card_acquisition_payin."transactionExternalPaymentId")`,
      )
      .leftJoin(
        'card_acquisition_payin',
        'cap',
        'transaction."externalPaymentId" = cap."transactionExternalPaymentId"',
      )
      .limit(batch)
      .getMany()
    return transactions.map((transaction) =>
      this.mapper.toDomainEntity(transaction),
    )
  }

  async employeeHasTransactionWithoutSucessfullPayin(
    employeeId: string,
  ): Promise<boolean> {
    return this.repository
      .createQueryBuilder('transaction')
      .where(`"transaction".status IN('Accepted','Settled')`)
      .andWhere(
        `NOT EXISTS (SELECT 1 FROM "card_acquisition_payin" "cap" WHERE "transaction"."externalPaymentId" = "cap"."transactionExternalPaymentId" AND "cap"."status" IN('Authorized','Captured'))`,
      )
      .andWhere(
        `(("transaction"."advantageRepartition" ->> 'EXTERNAL')::numeric <> 0)`,
      )
      .andWhere(
        `(NOT EXISTS (SELECT 1 FROM "transaction" "tr" WHERE "tr".id <> "transaction".id AND tr."externalPaymentId" = "transaction"."externalPaymentId") OR ("transaction".status = 'Settled'))`,
      )
      .andWhere(`"transaction"."employeeId" = :employeeId`, { employeeId })
      .getCount()
      .then((count) => count > 0)
  }

  // for typeorm 0.0.3 once nestjs/typeorm is up to date
  // Used to order a query
  protected orderQuery(
    params?: OrderBy<TransactionProps>,
  ): FindOptionsOrder<TransactionOrmEntity> {
    const order: FindOptionsOrder<TransactionOrmEntity> = {}
    if (isUndefined(params)) {
      return order
    }
    if (params.createdAt) {
      order.createdAt = params.createdAt
    }
    if (params.status) {
      order.status = params.status
    }
    if (params.paymentDate) {
      order.paymentDate = params.paymentDate
    }
    return order
  }

  // Used to construct a query
  protected prepareQuery(
    params: QueryParams<TransactionProps>,
  ): WhereCondition<TransactionOrmEntity> {
    const where: WhereCondition<TransactionOrmEntity> = {}
    if (params.id) {
      where.id = params.id.value
    }
    if (params.createdAt) {
      where.createdAt = params.createdAt.value
    }
    if (params.cardId) {
      where.cardId = params.cardId.value
    }
    if (params.employeeId) {
      where.employeeId = params.employeeId.value
    }
    if (params.status) {
      where.status = params.status
    }
    if (params.paymentDate) {
      where.paymentDate = params.paymentDate.value
    }
    return where
  }

  private findTransactionTransferJoint(
    unionTableName: string,
    employeeId: string,
    startDate?: Date,
    status: TransactionStatus[] = defaultTransactionStatusToDisplay,
  ) {
    let dateFilter = moment(startDate).endOf('day').toDate()

    return this.repository.manager
      .createQueryBuilder()
      .from((filterQb: SelectQueryBuilder<any>) => {
        const unionQueries: SelectQueryBuilder<any>[] = []
        //transactions
        unionQueries.push(
          this.findTransactionSubQuery(employeeId, dateFilter, status),
        )
        //transfers
        unionQueries.push(this.findTransferSubQuery(employeeId, dateFilter))
        return union(filterQb, ...unionQueries)
      }, unionTableName)
  }

  private findTransactionSubQuery(
    employeeId: string,
    dateFilter?: Date,
    status: TransactionStatus[] = defaultTransactionStatusToDisplay,
  ) {
    // Status that will be displayed even if they don't have an "history"
    const settledStatus = [
      TransactionStatus.Declined,
      TransactionStatus.Reversed,
      TransactionStatus.Settled,
    ]
    // Status that can be part of an "history" before being display (example: accepted can be followed by settled)
    const acceptedStatus = [
      TransactionStatus.Accepted,
      TransactionStatus.Declined,
      TransactionStatus.Reversed,
      TransactionStatus.Settled,
    ]
    let query = this.repository.manager
      .createQueryBuilder()
      .select([
        '"transaction"."id" "id"',
        '"transaction"."createdAt" "createdAt"',
        '"transaction"."updatedAt" "updatedAt"',
        '"transaction"."amount" "amount"',
        '"transaction"."paymentDate" "paymentDate"',
        '"transaction"."status"::text "status"',
        '"transaction"."declinedReason" "declinedReason"',
        '"merchant_category"."iconUrl"',
        'COALESCE("merchant_name"."merchantName", "transaction"."merchantName") AS "merchantName"',
      ])
      .from('transaction', 'transaction')
      .leftJoin(
        (sub: SelectQueryBuilder<TransactionOrmEntity>) => {
          let subQuery = sub
            .select([
              '"externalPaymentId" "externalPaymentId"',
              'max("status") "status"',
            ])
            .from('transaction', 'transaction')
            .where({ externalPaymentId: Not('') })
            .andWhere({
              expiredAt: IsNull(),
            })
            .andWhere({
              amount: Not(0),
            })
            .andWhere({ employeeId: employeeId })
            .andWhere({
              status: In(acceptedStatus),
            })
          if (dateFilter) {
            subQuery = subQuery.andWhere({
              paymentDate: LessThan(dateFilter),
            })
          }
          return subQuery.groupBy('"externalPaymentId"')
        },
        'acceptedTransaction',
        '"transaction"."externalPaymentId" = "acceptedTransaction"."externalPaymentId" AND "transaction"."status" = "acceptedTransaction"."status"',
      )
      .leftJoin(
        'merchant_category',
        'merchant_category',
        '"merchant_category"."mcc" = "transaction"."mcc"',
      )
      .leftJoin(
        (sub: SelectQueryBuilder<TransactionOrmEntity>) => {
          return sub
            .select([
              '"transaction"."id" AS "id"',
              'COALESCE("merchant_organization"."brandName", merchant."name") AS "merchantName"',
            ])
            .from('transaction', 'transaction')
            .leftJoin(
              'merchant',
              'merchant',
              '"merchant"."mid" = "transaction"."merchantId"',
            )
            .leftJoin(
              'merchant_merchant_organization',
              'merchant_merchant_organization',
              '"merchant_merchant_organization"."mid" = "merchant"."mid" AND CASE WHEN EXISTS (SELECT 1 FROM payment_solution WHERE LOWER("transaction"."merchantName") LIKE \'%\' || LOWER(payment_solution.name) || \'%\') THEN ("transaction"."merchantName" = "merchant_merchant_organization"."merchantName") ELSE (TRUE) END',
            )
            .leftJoin(
              'merchant_organization',
              'merchant_organization',
              '"merchant_organization"."siret" = "merchant_merchant_organization"."siret"',
            )
            .where('"merchant"."mid" = "transaction"."merchantId"')
            .orderBy('"merchant"."updatedAt"', 'DESC')
            .limit(1)
        },
        'merchant_name',
        '"merchant_name"."id" = "transaction"."id"',
      )
      .where({ employeeId: employeeId })
      .andWhere({
        expiredAt: IsNull(),
      })
      .andWhere({
        amount: Not(0),
      })
      .andWhere(
        '("transaction"."status" = ANY(:settledStatus) AND "acceptedTransaction"."status" IS NULL OR "transaction"."status" = ANY(:acceptedStatus) AND "acceptedTransaction"."status" IS NOT NULL)',
        {
          settledStatus,
          acceptedStatus,
        },
      )
    if (status.length) {
      query = query.andWhere({
        status: In(status),
      })
    }
    if (dateFilter) {
      query = query.andWhere({
        paymentDate: LessThan(dateFilter),
      })
    }
    return query
  }

  private findTransferSubQuery(employeeId: string, dateFilter?: Date) {
    let query = this.repository.manager
      .createQueryBuilder()
      .select([
        '"transfer"."id" "id"',
        '"transfer"."createdAt" "createdAt"',
        '"transfer"."updatedAt" "updatedAt"',
        `CASE WHEN "direction" = '${TransferDirection.CREDIT}' THEN "transfer"."amount" ELSE -"transfer"."amount" END "amount"`,
        '"transfer"."paymentDate" "paymentDate"',
        `'${TransactionStatus.Settled}' "status"`,
        'NULL as "declinedReason"',
        `CASE WHEN "source" = '${
          TransferSource.MEAL_TICKET_CREDIT
        }' THEN '${getIconUrlTransferSource(
          TransferSource.MEAL_TICKET_CREDIT,
        )}' ELSE CASE WHEN "source" = '${
          TransferSource.CASHBACK
        }' THEN '${getIconUrlTransferSource(
          TransferSource.CASHBACK,
        )}' ELSE NULL END END "iconUrl"`,
        '"transfer"."name"::text "merchantName"',
      ])
      .from('transfer', 'transfer')
      .leftJoin('wallet', 'wallet', '"wallet"."id" = "transfer"."walletId"')
      .where('"wallet"."employeeId" = :employeeId', { employeeId })
    if (dateFilter) {
      query = query.andWhere('"paymentDate" <= :dateFilter', { dateFilter })
    }
    return query
  }

  private getAcceptedPendingTransactionsQuery(
    dateFilter?: Date,
  ): SelectQueryBuilder<TransactionOrmEntity> {
    return this.repository
      .createQueryBuilder('transaction')
      .innerJoin(
        (sub: SelectQueryBuilder<TransactionOrmEntity>) => {
          return sub
            .select([
              '"externalPaymentId" "externalPaymentId"',
              'max("status") "status"',
            ])
            .from('transaction', 'transaction')
            .where({
              externalPaymentId: Not(''),
            })
            .andWhere({
              expiredAt: IsNull(),
            })
            .andWhere([
              {
                paymentDate: LessThan(dateFilter),
              },
              {
                status: Not(TransactionStatus.Accepted),
              },
            ])
            .groupBy('"externalPaymentId"')
            .having(`max("status") = :status`, {
              status: TransactionStatus.Accepted,
            })
        },
        'pendingTransaction',
        '"transaction"."externalPaymentId" = "pendingTransaction"."externalPaymentId" AND "transaction"."status" = "pendingTransaction"."status"',
      )
      .where({
        expiredAt: IsNull(),
      })
      .andWhere({
        status: TransactionStatus.Accepted,
      })
  }
}
