import { ExceptionBase } from '../../../libs/exceptions/index'

export class OrganizationAdminAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Organization admin already exists'

  public readonly code: string = 'ORGANIZATION_ADMIN.ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(OrganizationAdminAlreadyExistsError.message, metadata)
  }
}

export class OrganizationAdminAlreadyActivatedError extends ExceptionBase {
  static readonly message = 'OrganizationAdmin already activated'

  public readonly code: string = 'ORGANIZATION_ADMIN.ALREADY_ACTIVATED'

  constructor(metadata?: unknown) {
    super(OrganizationAdminAlreadyActivatedError.message, metadata)
  }
}

export class OrganizationAdminNotActivatedError extends ExceptionBase {
  static readonly message = 'OrganizationAdmin not activated'

  public readonly code: string = 'ORGANIZATION_ADMIN.NOT_ACTIVATED'

  constructor(metadata?: unknown) {
    super(OrganizationAdminNotActivatedError.message, metadata)
  }
}

export class WrongOrganizationAdminPasswordError extends ExceptionBase {
  static readonly message = 'Wrong organization admin password'

  public readonly code: string = 'ORGANIZATION_ADMIN.WRONG_PASSWORD'

  constructor(metadata?: unknown) {
    super(WrongOrganizationAdminPasswordError.message, metadata)
  }
}

export class OrganizationAdminEmailNotFound extends ExceptionBase {
  static readonly message = 'OrganizationAdmin email not found'

  public readonly code: string = 'ORGANIZATION_ADMIN.EMAIL_NOT_FOUND'

  constructor(metadata?: unknown) {
    super(OrganizationAdminEmailNotFound.message, metadata)
  }
}

export class OrganizationAdminPasswordFormatNotCorrectError extends ExceptionBase {
  static readonly message =
    'OrganizationAdmin password format not correct. OrganizationAdmin password must be between 10 and 15 character long'

  public readonly code: string =
    'ORGANIZATION_ADMIN.PASSWORD_FORMAT_NOT_CORRECT'

  constructor(metadata?: unknown) {
    super(OrganizationAdminPasswordFormatNotCorrectError.message, metadata)
  }
}

export class OrganizationAdminIsTheLastOneError extends ExceptionBase {
  static readonly message = 'Cannot delete the last admin of an organization'

  public readonly code: string = 'ORGANIZATION_ADMIN.IS_LAST_ONE'

  constructor(metadata?: unknown) {
    super(OrganizationAdminIsTheLastOneError.message, metadata)
  }
}

export class OrganizationAdminNotFoundError extends ExceptionBase {
  static readonly message = 'OrganizationAdmin not found'

  public readonly code: string = 'ORGANIZATION_ADMIN.NOT_FOUND'

  constructor(metadata?: unknown) {
    super(OrganizationAdminNotFoundError.message, metadata)
  }
}

export class OrganizationAdminRefreshTokenError extends ExceptionBase {
  static readonly message = 'Organization admin refreshToken is not correct'

  public readonly code: string = 'ORGANIZATION_ADMIN.REFRESH_TOKEN_NOT_CORRECT'

  constructor(metadata?: unknown) {
    super(OrganizationAdminRefreshTokenError.message, metadata)
  }
}

export class OrganizationIdIsMissingError extends ExceptionBase {
  static readonly message = 'Organization id is missing'

  public readonly code: string = 'ORGANIZATION_ADMIN.ORGANIZATION_ID_IS_MISSING'

  constructor(metadata?: unknown) {
    super(OrganizationIdIsMissingError.message, metadata)
  }
}

export class AccountantAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Accountant already exists'

  public readonly code: string = 'ACCOUNTANT.ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(AccountantAlreadyExistsError.message, metadata)
  }
}

export class OrganizationAdminPasswordTooManyFailedAttemptError extends ExceptionBase {
  static readonly message =
    'Too many failed attempt for organization admin password'

  public readonly code: string =
    'ORGANIZATION_ADMIN.PASSWORD_TOO_MANY_FAILED_ATTEMPT'

  constructor(metadata?: unknown) {
    super(OrganizationAdminPasswordTooManyFailedAttemptError.message, metadata)
  }
}
