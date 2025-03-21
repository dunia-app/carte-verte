import { ExceptionBase } from '../../../libs/exceptions/index'

export class MerchantMerchantOrganizationAlreadyExistsError extends ExceptionBase {
  static readonly message = 'MerchantMerchantOrganization already exists'

  public readonly code: string = 'MERCHANT_MERCHANT_ORGANIZATION.ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(MerchantMerchantOrganizationAlreadyExistsError.message, metadata)
  }
}
