import { ExceptionBase } from '../../../libs/exceptions/index'

export class EmployeeAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Employee already exists'

  public readonly code: string = 'EMPLOYEE.ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(EmployeeAlreadyExistsError.message, metadata)
  }
}

export class EmployeeAlreadyActivatedError extends ExceptionBase {
  static readonly message = 'Employee already activated'

  public readonly code: string = 'EMPLOYEE.ALREADY_ACTIVATED'

  constructor(metadata?: unknown) {
    super(EmployeeAlreadyActivatedError.message, metadata)
  }
}

export class EmployeeExternalIdAlreadySetError extends ExceptionBase {
  static readonly message = 'Employee external id already set'

  public readonly code: string = 'EMPLOYEE.EXTERNAL_ID_ALREADY_SET'

  constructor(metadata?: unknown) {
    super(EmployeeExternalIdAlreadySetError.message, metadata)
  }
}

export class EmployeeExternalIdNotSetError extends ExceptionBase {
  static readonly message = 'Employee external id not set'

  public readonly code: string = 'EMPLOYEE.EXTERNAL_ID_NOT_SET'

  constructor(metadata?: unknown) {
    super(EmployeeExternalIdNotSetError.message, metadata)
  }
}

export class EmployeeNotActivatedError extends ExceptionBase {
  static readonly message =
    'Employee not activated. Set a code to activate account'

  public readonly code: string = 'EMPLOYEE.NOT_ACTIVATED'

  constructor(metadata?: unknown) {
    super(EmployeeNotActivatedError.message, metadata)
  }
}

export class EmployeeAlreadyRemovedError extends ExceptionBase {
  static readonly message =
    'Employee already removed and scheduled to be deleted'

  public readonly code: string = 'EMPLOYEE.ALREADY_REMOVED'

  constructor(metadata?: unknown) {
    super(EmployeeAlreadyRemovedError.message, metadata)
  }
}

export class EmployeeNotRemovedError extends ExceptionBase {
  static readonly message = 'Employee not removed'

  public readonly code: string = 'EMPLOYEE.NOT_REMOVED'

  constructor(metadata?: unknown) {
    super(EmployeeNotRemovedError.message, metadata)
  }
}

export class EmployeeNotToBeDeletedError extends ExceptionBase {
  static readonly message =
    'Employee has not been schedule for deletion and thus cannot be deleted'

  public readonly code: string = 'EMPLOYEE.NOT_TO_BE_DELETED'

  constructor(metadata?: unknown) {
    super(EmployeeNotToBeDeletedError.message, metadata)
  }
}

export class WrongEmployeeCodeError extends ExceptionBase {
  static readonly message = 'Wrong employee code'

  public readonly code: string = 'EMPLOYEE.WRONG_CODE'

  constructor(failedAttemps: number, metadata?: unknown) {
    super(WrongEmployeeCodeError.message, metadata)
    this.code = `${this.code}_${failedAttemps}`
  }
}

export class EmployeeCodeTooManyFailedAttemptError extends ExceptionBase {
  static readonly message = 'Too many failed attempt for employee code'

  public readonly code: string = 'EMPLOYEE.CODE_TOO_MANY_FAILED_ATTEMPT'

  constructor(metadata?: unknown) {
    super(EmployeeCodeTooManyFailedAttemptError.message, metadata)
  }
}

export class EmployeeCodeFormatNotCorrectError extends ExceptionBase {
  static readonly message =
    'Employee code format not correct. Employee code must be 4 numbers long'

  public readonly code: string = 'EMPLOYEE.CODE_FORMAT_NOT_CORRECT'

  constructor(metadata?: unknown) {
    super(EmployeeCodeFormatNotCorrectError.message, metadata)
  }
}

export class EmployeeAlreadyAcceptedCguError extends ExceptionBase {
  static readonly message = 'Employee already accepted cgu'

  public readonly code: string = 'EMPLOYEE.ALREADY_ACCEPTED_CGU'

  constructor(metadata?: unknown) {
    super(EmployeeAlreadyAcceptedCguError.message, metadata)
  }
}

export class EmployeeHasNotAcceptedCguError extends ExceptionBase {
  static readonly message = 'Employee has not accepted cgu'

  public readonly code: string = 'EMPLOYEE.HAS_NOT_ACCEPTED_CGU'

  constructor(metadata?: unknown) {
    super(EmployeeHasNotAcceptedCguError.message, metadata)
  }
}

export class WrongSmsCodeError extends ExceptionBase {
  static readonly message = 'Wrong sms code'

  public readonly code: string = 'SMS.WRONG_CODE'

  constructor(metadata?: unknown) {
    super(WrongSmsCodeError.message, metadata)
  }
}

export class MobileTokenNotSetError extends ExceptionBase {
  static readonly message =
    'Mobile token not found. Make sure that you have validated your sms token'

  public readonly code: string = 'MOBILE_TOKEN.NOT_FOUND'

  constructor(metadata?: unknown) {
    super(MobileTokenNotSetError.message, metadata)
  }
}

export class EmployeeFrozenError extends ExceptionBase {
  static readonly message =
    'Employee has been frozen. Contact an admin to unfreeze'

  public readonly code: string = 'EMPLOYEE.FROZEN'

  constructor(metadata?: unknown) {
    super(EmployeeFrozenError.message, metadata)
  }
}

export class EmployeeAlreadyFrozenError extends ExceptionBase {
  static readonly message = 'Employee has already been frozen'

  public readonly code: string = 'EMPLOYEE.ALREADY_FROZEN'

  constructor(metadata?: unknown) {
    super(EmployeeAlreadyFrozenError.message, metadata)
  }
}

export class EmployeeAlreadyUnfrozenError extends ExceptionBase {
  static readonly message = 'Employee has already been unfrozen'

  public readonly code: string = 'EMPLOYEE.ALREADY_UNFROZEN'

  constructor(metadata?: unknown) {
    super(EmployeeAlreadyUnfrozenError.message, metadata)
  }
}

export class EmployeeNotFoundError extends ExceptionBase {
  static readonly message = 'Employee not found'

  public readonly code: string = 'EMPLOYEE.NOT_FOUND'

  constructor(metadata?: unknown) {
    super(EmployeeNotFoundError.message, metadata)
  }
}

export class EmployeeNameNotValideError extends ExceptionBase {
  static readonly message = 'Employee name not valide'

  public readonly code: string = 'EMPLOYEE.NAME_NOT_VALIDE'

  constructor(metadata?: unknown) {
    super(EmployeeNameNotValideError.message, metadata)
  }
}

export class EmployeeEmailDuplicatedError extends ExceptionBase {
  static readonly message = 'Employee email is duplicated in the list provided'

  public readonly code: string = 'EMPLOYEE.EMAIL_DUPLICATED'

  constructor(metadata?: unknown) {
    super(EmployeeEmailDuplicatedError.message, metadata)
  }
}

export class EmployeeBalanceNotZeroError extends ExceptionBase {
  static readonly message =
    'Employee still has money and thus cannot be deleted'

  public readonly code: string = 'EMPLOYEE.BALANCE_NOT_ZERO'

  constructor(metadata?: unknown) {
    super(EmployeeBalanceNotZeroError.message, metadata)
  }
}

export class EmployeeRefreshTokenError extends ExceptionBase {
  static readonly message = 'Employee refreshToken is not correct'

  public readonly code: string = 'EMPLOYEE.REFRESH_TOKEN_NOT_CORRECT'

  constructor(metadata?: unknown) {
    super(EmployeeRefreshTokenError.message, metadata)
  }
}

export class EmployeeCreationMissingInfoError extends ExceptionBase {
  static readonly message = 'Unable to find all required info'

  public readonly code: string = 'EMPLOYEE_CREATION.MISSING_INFO'

  constructor(metadata?: unknown) {
    super(EmployeeCreationMissingInfoError.message, metadata)
    this.code += '_' + String(metadata)?.toUpperCase()
  }
}

export class EmployeeNewDeviceNotValidated extends ExceptionBase {
  static readonly message = 'New device not validated before login'

  public readonly code: string = 'EMPLOYEE.NEW_DEVICE_NOT_VALIDATED'

  constructor(metadata?: unknown) {
    super(EmployeeNewDeviceNotValidated.message, metadata)
  }
}

export class DeviceIdAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Device id already exists for this employee'

  public readonly code: string = 'DEVICE_ID.ALREADY_EXISTS_FOR_EMPLOYEE'

  constructor(metadata?: unknown) {
    super(DeviceIdAlreadyExistsError.message, metadata)
  }
}

export class EmployeeEmailNotFound extends ExceptionBase {
  static readonly message = 'Employee email not found'

  public readonly code: string = 'EMPLOYEE.EMAIL_NOT_FOUND'

  constructor(metadata?: unknown) {
    super(EmployeeEmailNotFound.message, metadata)
  }
}
