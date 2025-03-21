import { ExceptionBase } from '../../../exceptions/index'

export class EmailNotValideError extends ExceptionBase {
  static readonly message = 'Email not valide.'

  public readonly code: string = 'EMAIL.NOT_VALIDE'

  constructor(metadata?: unknown) {
    super(EmailNotValideError.message, metadata)
  }
}
