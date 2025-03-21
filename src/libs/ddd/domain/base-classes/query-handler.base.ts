import { ExceptionBase } from '../../../exceptions/index'
import { Result } from '../utils/result.util'
import { Query } from './query.base'

export abstract class QueryHandlerBase<
  QueryHandlerReturnType = unknown,
  QueryHandlerError extends ExceptionBase = ExceptionBase,
> {
  // For consistency with a CommandHandlerBase and DomainEventHandler
  abstract handle(
    query: Query<QueryHandlerReturnType, QueryHandlerError>,
  ): Promise<Result<QueryHandlerReturnType, QueryHandlerError>>

  execute(query: Query<QueryHandlerReturnType, QueryHandlerError>) {
    return this.handle(query)
  }
}
