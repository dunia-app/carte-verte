import {
  ArgumentsHost,
  Catch,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { EntityNotFoundError, QueryFailedError } from 'typeorm'

import { GqlExceptionFilter } from '@nestjs/graphql'
import { handlePostgresErrors } from './handle-postgres-errors'

@Catch(QueryFailedError, EntityNotFoundError)
export class TypeormErrorFilter implements GqlExceptionFilter {
  catch(
    exception: QueryFailedError | EntityNotFoundError,
    _host: ArgumentsHost,
  ) {
    const err = handlePostgresErrors(exception)
    if (exception instanceof EntityNotFoundError) {
      throw new NotFoundException([
        {
          path: 'item',
          type: 'notFound',
          translateParams: {},
        },
      ])
    }
    throw new UnprocessableEntityException(err)
  }
}
