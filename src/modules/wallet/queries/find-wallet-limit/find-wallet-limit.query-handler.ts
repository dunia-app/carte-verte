import { QueryHandler } from '@nestjs/cqrs'
import { toScale } from '../../../../helpers/math.helper'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { AdvantageRepository } from '../../../merchant/database/advantage/advantage.repository'
import {
  AdvantagePeriod,
  AdvantageType,
  noKycMonthlyLimit,
} from '../../../merchant/domain/entities/advantage.types'
import { TransactionRepository } from '../../../transaction/database/transaction/transaction.repository'
import { TransactionRepositoryPort } from '../../../transaction/database/transaction/transaction.repository.port'
import { CardAcquisitionPayinRepository } from '../../database/card-acquisition-payin/card-acquisition-payin.repository'
import { CardAcquisitionRepository } from '../../database/card-acquisition/card-acquisition.repository'
import { CardAcquisitionPayinStatus } from '../../domain/entities/card-acquisition-payin.types'
import { Limit } from '../../domain/value-objects/limit.value-object'
import { FindWalletLimitQuery } from './find-wallet-limit.query'

@QueryHandler(FindWalletLimitQuery)
export class FindWalletLimitQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly advantageRepo: AdvantageRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly cardAcquisitionRepo: CardAcquisitionRepository,
    private readonly cardAcquisitionPayinRepo: CardAcquisitionPayinRepository,
  ) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves wallets directly from a repository.
   */
  async handle(
    query: FindWalletLimitQuery,
  ): Promise<Result<Map<AdvantageType, Limit>, ExceptionBase>> {
    const advantages = await this.advantageRepo.findMany()
    const limitPerAdvantage: Map<AdvantageType, Limit> = new Map()
    await Promise.all(
      advantages.map(async (advantage) => {
        const wallet = query.wallets.find(
          (wallet) => wallet.advantage === advantage.type,
        )
        if (!wallet) {
          return
        }
        if (advantage.type === AdvantageType.NONE) {
          limitPerAdvantage.set(
            advantage.type,
            new Limit({
              DAILY: Math.max(wallet.authorizedBalance, 0),
              MONTHLY: undefined,
              YEARLY: undefined,
            }),
          )
          return
        }
        if (
          advantage.limitPeriod === AdvantagePeriod.DAILY &&
          !advantage.isDateAllowed(new Date(), query.employee.isSundayWorker)
        ) {
          limitPerAdvantage.set(
            advantage.type,
            new Limit({
              DAILY: 0,
              MONTHLY: 0,
              YEARLY: 0,
            }),
          )
          return
        }
        if (advantage.type === AdvantageType.EXTERNAL) {
          const [cardAcquisition, sumCurrentMonth] = await Promise.all([
            this.cardAcquisitionRepo.findOneActiveByEmployeeId(
              query.employee.id.value,
            ),
            this.cardAcquisitionPayinRepo.sumLast30DaysByStatusAndEmployeeId(
              query.employee.id.value,
              CardAcquisitionPayinStatus.Captured,
            ),
          ])
          limitPerAdvantage.set(
            advantage.type,
            new Limit({
              DAILY: cardAcquisition ? noKycMonthlyLimit : 0,
              MONTHLY: Math.max(noKycMonthlyLimit - sumCurrentMonth, 0),
              YEARLY: undefined,
            }),
          )
          return
        }
        const sum = await this.getSumForPeriod(
          query.employee.id.value,
          advantage.type,
          advantage.limitPeriod,
          this.transactionRepo,
        )
        const limitLeft = isUndefined(sum)
          ? advantage.legalLimit
          : toScale(Math.max(Number(advantage.legalLimit) + Number(sum), 0))
        limitPerAdvantage.set(
          advantage.type,
          new Limit({
            DAILY:
              advantage.limitPeriod === AdvantagePeriod.DAILY
                ? limitLeft
                : undefined,
            MONTHLY:
              advantage.limitPeriod === AdvantagePeriod.MONTHLY
                ? limitLeft
                : undefined,
            YEARLY:
              advantage.limitPeriod === AdvantagePeriod.YEARLY
                ? limitLeft
                : undefined,
          }),
        )
      }),
    )
    return Result.ok(limitPerAdvantage)
  }

  getSumForPeriod(
    employeeId: string,
    advantage: AdvantageType,
    period: AdvantagePeriod,
    transactionRepo: TransactionRepositoryPort,
  ): Promise<number | undefined> {
    const dateFormat =
      period === AdvantagePeriod.DAILY
        ? 'YYYY-MM-dd'
        : period === AdvantagePeriod.MONTHLY
        ? 'YYYY-MM'
        : period === AdvantagePeriod.YEARLY
        ? 'YYYY'
        : undefined
    // return this.redis.fetch(
    //   `sumForPeriod:${employeeId}:${period}:${moment().format(dateFormat)}`,
    //   CacheTimes.OneDay,
    //   async () => {
    return transactionRepo.sumAmountForAdvantageOnPeriod(
      employeeId,
      advantage,
      period,
    )
    //   },
    // )
  }
}
