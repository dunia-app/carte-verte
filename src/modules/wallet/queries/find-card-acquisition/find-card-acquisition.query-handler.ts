import { QueryHandler } from '@nestjs/cqrs'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import {
  ExceptionBase,
  NotFoundException,
} from '../../../../libs/exceptions/index'
import { CardAcquisitionRepository } from '../../database/card-acquisition/card-acquisition.repository'
import { CardAcquisitionResponse } from '../../dtos/card-acquisition.dto'
import { FindCardAcquisitionQuery } from './find-card-acquisition.query'

@QueryHandler(FindCardAcquisitionQuery)
export class FindCardAcquisitionQueryHandler extends QueryHandlerBase {
  constructor(private readonly cardAcquisitionRepo: CardAcquisitionRepository) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves cardAcquisitions directly from a repository.
   */
  async handle(
    query: FindCardAcquisitionQuery,
  ): Promise<Result<CardAcquisitionResponse, ExceptionBase>> {
    try {
      const cardAcquisition =
        await this.cardAcquisitionRepo.findOneActiveOrPendingByEmployeeIdOrThrow(
          query.employeeId,
        )
      return Result.ok(new CardAcquisitionResponse(cardAcquisition))
    } catch (error) {
      if (error instanceof NotFoundException) return Result.err(error)
      throw error
    }
  }
}
