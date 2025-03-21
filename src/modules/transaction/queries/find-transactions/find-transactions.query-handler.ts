import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { TransactionRepository } from '../../database/transaction/transaction.repository'
import {
  TransactionResponse,
  TransactionsByMonth,
  TransactionsResponse,
} from '../../dtos/transaction.response.dto'
import { FindTransactionsQuery } from './find-transactions.query'
import moment = require('moment')

@QueryHandler(FindTransactionsQuery)
export class FindTransactionsQueryHandler extends QueryHandlerBase {
  constructor(private readonly transactionRepo: TransactionRepository) {
    super()
  }

  async handle(
    query: FindTransactionsQuery,
  ): Promise<Result<TransactionsResponse, ExceptionBase>> {
    const status = query.status ? [query.status] : undefined
    const paginationResult =
      await this.transactionRepo.findManyCursorPaginatedAndCount(
        query.employeeId,
        query.pagination,
        query.startDate?.value,
        status,
      )

    const items: TransactionResponse[] = []
    const itemsByMonth: TransactionsByMonth[] = []
    const monthToDateMap = new Map()

    paginationResult.data.forEach((transaction) => {
      const transactionResponse = new TransactionResponse(transaction)
      const paymentMonth = moment(transaction.paymentDate.value)
        .utcOffset(0, true)
        .startOf('month')
        .toISOString()
      let monthInfo: TransactionsByMonth = monthToDateMap.get(paymentMonth)
      if (!monthInfo) {
        monthInfo = {
          items: [],
          month: new Date(paymentMonth),
        }
        monthToDateMap.set(paymentMonth, monthInfo)
        itemsByMonth.push(monthInfo)
      }
      monthInfo.items.push(transactionResponse)
      items.push(transactionResponse)
    })
    return Result.ok({
      itemsByMonth: itemsByMonth,
      data: items,
      count: paginationResult.count,
      before: paginationResult.before,
      after: paginationResult.after,
    })
  }
}
