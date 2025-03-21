import { ExceptionBase } from '../../../libs/exceptions/index'

export class UserAlreadyExistsError extends ExceptionBase {
  static readonly message = 'User already exists'

  public readonly code: string = 'USER.ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(UserAlreadyExistsError.message, metadata)
  }
}

export class UserAlreadyActivatedError extends ExceptionBase {
  static readonly message = 'User already activated'

  public readonly code: string = 'USER.ALREADY_ACTIVATED'

  constructor(metadata?: unknown) {
    super(UserAlreadyActivatedError.message, metadata)
  }
}
