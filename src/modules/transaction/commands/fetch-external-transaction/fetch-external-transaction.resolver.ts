import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Baas } from '../../../../infrastructure/baas/baas'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { CardRepository } from '../../../card/database/card/card.repository'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { TransactionRepository } from '../../database/transaction/transaction.repository'
import { FetchExternalTransactionRequest } from './fetch-external-transaction.request.dto'
import { fetchExternalTransaction } from './fetch-external-transaction.service'

@ObjectType()
class FetchExternalTransactionResponse extends ErrorWithResponse(
  [],
  'FetchExternalTransactionErrorUnion',
  Number,
) {}

@Resolver()
export class FetchExternalTransactionGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly baas: Baas,
    private readonly transactionRepo: TransactionRepository,
    private readonly cardRepo: CardRepository,
  ) {}

  @AppMutation(() => FetchExternalTransactionResponse, UserRoles.superAdmin)
  async fetchExternalTransaction(
    @Args('input') input: FetchExternalTransactionRequest,
  ): Promise<FetchExternalTransactionResponse> {
    const res = await fetchExternalTransaction(
      this.commandBus,
      this.baas,
      this.transactionRepo,
      this.cardRepo,
      input.from,
      input.to,
      input.externalPaymentId,
    )
    return new FetchExternalTransactionResponse(res)
  }
}
