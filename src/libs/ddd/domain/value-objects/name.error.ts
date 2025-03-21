import { ExceptionBase } from '../../../exceptions/index'

export class NameNotValideError extends ExceptionBase {
  static readonly message =
    'Name not valide. Name is either too short or too long'

  public readonly code: string = 'NAME.NOT_VALIDE'

  constructor(metadata?: unknown) {
    super(NameNotValideError.message, metadata)
  }
}
