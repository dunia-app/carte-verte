import { ExceptionBase } from '../../../libs/exceptions/index'

export class OrganizationAdminRequestAlreadyExistsError extends ExceptionBase {
  static readonly message = 'Organization admin request already exists'

  public readonly code: string = 'ORGANIZATION_ADMIN_REQUEST.ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(OrganizationAdminRequestAlreadyExistsError.message, metadata)
  }
}

export class OrganizationAdminRequestAlreadyAcceptedError extends ExceptionBase {
  static readonly message = 'Organization admin request already accepted'

  public readonly code: string = 'ORGANIZATION_ADMIN_REQUEST.ALREADY_ACCEPTED'

  constructor(metadata?: unknown) {
    super(OrganizationAdminRequestAlreadyAcceptedError.message, metadata)
  }
}

export class OrganizationAdminRequestHasNoOfferError extends ExceptionBase {
  static readonly message = 'Organization admin request has no offer'

  public readonly code: string = 'ORGANIZATION_ADMIN_REQUEST.HAS_NO_OFFER'

  constructor(metadata?: unknown) {
    super(OrganizationAdminRequestHasNoOfferError.message, metadata)
  }
}
