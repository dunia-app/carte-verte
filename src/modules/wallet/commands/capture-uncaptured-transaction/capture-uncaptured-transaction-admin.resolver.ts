import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { logger } from '../../../../helpers/application.helper'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { TransactionRepository } from '../../../transaction/database/transaction/transaction.repository'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CaptureCardAcquisitionPayinCommand } from '../capture-card-acquisition-payin/capture-card-acquisition-payin.command'

const defaultBatchSize = 50

@ObjectType()
class CaptureUncapturedTransactionResponse extends ErrorWithResponse(
  [],
  'CaptureUncapturedTransactionErrorUnion',
  Number,
) {}

@Resolver()
export class CaptureUncapturedTransactionGraphqlResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly transactionRepo: TransactionRepository,
  ) {}

  @AppMutation(() => CaptureUncapturedTransactionResponse, UserRoles.superAdmin)
  async captureUncapturedTransactionAdmin(
    @Args('batchSize', { nullable: true, defaultValue: defaultBatchSize })
    batchSize: number,
  ): Promise<CaptureUncapturedTransactionResponse> {
    const uncapturedTransactions =
      await this.transactionRepo.findManyExternalUncaptured(batchSize)
    if (uncapturedTransactions.length === 0) {
      return new CaptureUncapturedTransactionResponse(Result.ok(0))
    }
    let capturedTransactionCount = 0
    for (const uncapturedTransaction of uncapturedTransactions) {
      try {
        const captureCommand = new CaptureCardAcquisitionPayinCommand({
          employeeId: uncapturedTransaction.employeeId!.value,
          amount:
            -uncapturedTransaction.advantageRepartition[
              AdvantageType.EXTERNAL
            ]!,
          transactionExternalPaymentId: uncapturedTransaction.externalPaymentId,
        })
        const capturedTransaction = await this.commandBus.execute(
          captureCommand,
        )
        if (capturedTransaction.isErr) {
          return new CaptureUncapturedTransactionResponse(
            Result.err(capturedTransaction.error),
          )
        } else {
          capturedTransactionCount++
        }
      } catch (error: any) {
        logger.error(`[captureUncapturedTransaction]: ${error}`)
      }
    }

    return new CaptureUncapturedTransactionResponse(
      Result.ok(capturedTransactionCount),
    )
  }
}
