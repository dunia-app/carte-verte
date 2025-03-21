import { ExceptionBase } from '../../../libs/exceptions/index'

export class OrganizationAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Organization already exists'

  public readonly code: string = 'ORGANIZATION.ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(OrganizationAlreadyExistsError.message, metadata)
  }
}

export class OrganizationNotActivatedError extends ExceptionBase {
  static readonly message =
    'Organization need an address, a siret and to accept the offer proposed to be activated'

  public readonly code: string = 'ORGANIZATION.NOT_ACTIVATED'

  constructor(metadata?: unknown) {
    super(OrganizationNotActivatedError.message, metadata)
  }
}

export class OrganizationAlreadyHasSiretError extends ExceptionBase {
  static readonly message = 'Organization already has siret'

  public readonly code: string = 'ORGANIZATION.ALREADY_HAS_SIRET'

  constructor(metadata?: unknown) {
    super(OrganizationAlreadyHasSiretError.message, metadata)
  }
}

export class OrganizationAlreadyAcceptedOfferError extends ExceptionBase {
  static readonly message = 'Organization already accepted offer'

  public readonly code: string = 'ORGANIZATION.ALREADY_ACCEPTED_OFFER'

  constructor(metadata?: unknown) {
    super(OrganizationAlreadyAcceptedOfferError.message, metadata)
  }
}

export class OrganizationHasNoSettingsError extends ExceptionBase {
  static readonly message = 'Organization has not set its settings yet'

  public readonly code: string = 'ORGANIZATION.NO_SETTINGS'

  constructor(metadata?: unknown) {
    super(OrganizationHasNoSettingsError.message, metadata)
  }
}

export class OrganizationCoveragePercentIsIncorrectError extends ExceptionBase {
  static readonly message = 'Organization coverage percent is not correct'

  public readonly code: string = 'ORGANIZATION.INCORRECT_COVERAGE_PERCENT'

  constructor(metadata?: unknown) {
    super(OrganizationCoveragePercentIsIncorrectError.message, metadata)
  }
}

export class OrganizationMealTicketAmountIsIncorrectError extends ExceptionBase {
  static readonly message = 'Organization meal ticket amount is not correct'

  public readonly code: string = 'ORGANIZATION.INCORRECT_MEAL_TICKET_AMOUNT'

  constructor(metadata?: unknown) {
    super(OrganizationMealTicketAmountIsIncorrectError.message, metadata)
  }
}

export class OrganizationMealTicketDayIsIncorrectError extends ExceptionBase {
  static readonly message = 'Organization meal ticket day is not correct'

  public readonly code: string = 'ORGANIZATION.INCORRECT_MEAL_TICKET_DAY'

  constructor(metadata?: unknown) {
    super(OrganizationMealTicketDayIsIncorrectError.message, metadata)
  }
}

export class OrganizationPhysicalCardCoverageIsNegativeError extends ExceptionBase {
  static readonly message = 'Organization physical card coverage is negative'

  public readonly code: string = 'ORGANIZATION.NEGATIVE_PHYSICAL_CARD_COVERAGE'

  constructor(metadata?: unknown) {
    super(OrganizationPhysicalCardCoverageIsNegativeError.message, metadata)
  }
}
