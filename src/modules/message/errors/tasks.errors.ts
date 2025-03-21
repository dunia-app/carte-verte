import { ExceptionBase } from '../../../libs/exceptions/index'

export class SendEmailFailError extends ExceptionBase {
  static readonly message = 'The email could not be sent'

  public readonly code: string = 'TASK.SEND_EMAIL_FAIL'

  constructor(metadata?: unknown) {
    super(SendEmailFailError.message, metadata)
  }
}
