import { Command as _Command } from '@nestjs-architects/typed-cqrs';
import {
  ArgumentNotProvidedException,
  ExceptionBase,
} from '../../../exceptions/index';
import { Guard } from '../guard';
import { Result } from '../utils/result.util';
import { UUID } from '../value-objects/uuid.value-object';
const cryptoRandomString = require('crypto-random-string');


export type CommandProps<T> = Omit<
  T,
  'correlationId' | 'id' | 'resultType$e1ca39fa'
> &
  Partial<Omit<Command<T, ExceptionBase>, 'resultType$e1ca39fa'>>

export class Command<
  T,
  R extends ExceptionBase = ExceptionBase,
> extends _Command<Result<T, R>> {
  /**
   * Command id, in case if we want to save it
   * for auditing purposes and create a correlation/causation chain
   */
  public readonly id: string

  /** ID for correlation purposes (for UnitOfWork, for commands that
   *  arrive from other microservices,logs correlation etc). */
  public readonly correlationId: string

  /**
   * Causation id to reconstruct execution ordering if needed
   */
  public readonly causationId?: string

  constructor(props: CommandProps<unknown>) {
    super()
    if (Guard.isEmpty(props)) {
      throw new ArgumentNotProvidedException(
        'Command props should not be empty',
      )
    }
    this.correlationId =
      props.correlationId || cryptoRandomString({ length: 8 })
    this.id = props.id || UUID.generate().unpack()
  }
}
