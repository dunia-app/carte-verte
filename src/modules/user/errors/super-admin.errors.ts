import { ExceptionBase } from '../../../libs/exceptions/index'

export class WrongSuperAdminPasswordError extends ExceptionBase {
  static readonly message = 'Wrong super admin password'

  public readonly code: string = 'SUPER_EMPLOYEE.WRONG_PASSWORD'

  constructor(metadata?: unknown) {
    super(WrongSuperAdminPasswordError.message, metadata)
  }
}
