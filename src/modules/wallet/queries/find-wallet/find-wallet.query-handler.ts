import { QueryBus, QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { EmployeeRepository } from '../../../organization/database/employee/employee.repository'
import { WalletRepository } from '../../database/wallet/wallet.repository'
import { WalletResponse } from '../../dtos/wallet.response.dto'
import { FindWalletLimitQuery } from '../find-wallet-limit/find-wallet-limit.query'
import { FindWalletQuery } from './find-wallet.query'

@QueryHandler(FindWalletQuery)
export class FindWalletQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly walletRepo: WalletRepository,
    private readonly employeeRepo: EmployeeRepository,
    private readonly queryBus: QueryBus,
  ) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves wallets directly from a repository.
   */
  async handle(
    query: FindWalletQuery,
  ): Promise<Result<WalletResponse, ExceptionBase>> {
    const [wallets, employee] = await Promise.all([
      this.walletRepo.findManyByEmployeeId(query.employeeId),
      this.employeeRepo.findOneByIdOrThrow(query.employeeId),
    ])
    const queryLimit = new FindWalletLimitQuery({
      wallets: wallets,
      employee: employee,
    })
    const limitPerAdvantage = await this.queryBus.execute(queryLimit)

    if (limitPerAdvantage.isErr) {
      return Result.err(limitPerAdvantage.error)
    }

    return Result.ok(new WalletResponse(wallets, limitPerAdvantage.value))
  }
}
