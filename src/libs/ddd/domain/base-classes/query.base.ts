import { Query as _Query } from '@nestjs-architects/typed-cqrs';
import { ExceptionBase } from '../../../exceptions/index';
import { Result } from '../utils/result.util';
const cryptoRandomString = require('crypto-random-string');

export type QueryProps<T> = Omit<
  T,
  'correlationId' | 'id' | 'resultType$f9fbca36'
> &
  Partial<Omit<Query<unknown, ExceptionBase>, 'resultType$f9fbca36'>>

export abstract class Query<
  T,
  R extends ExceptionBase = ExceptionBase,
> extends _Query<Result<T, R>> {
  public readonly correlationId: string

  constructor(props: QueryProps<unknown>) {
    super()
    this.correlationId =
      props.correlationId || cryptoRandomString({ length: 8 })
  }
}
