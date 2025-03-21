import { ExceptionBase } from '../../../libs/exceptions/index'

export class OrganizationDefautWalletSettingsNotEnoughBalanceError extends ExceptionBase {
  static readonly message =
    'OrganizationDefautWalletSettings has not enough balance'

  public readonly code: string = 'ORGANIZATION_WALLET.NOT_ENOUGH_BALANCE'

  constructor(metadata?: unknown) {
    super(
      OrganizationDefautWalletSettingsNotEnoughBalanceError.message,
      metadata,
    )
  }
}

export class OrganizationDefautWalletSettingsAlreadyExistsError extends ExceptionBase {
  static readonly message = 'OrganizationDefautWalletSettings already exists'

  public readonly code: string = 'ORGANIZATION_WALLET.ALREADY_EXISTS'

  constructor(metadata?: unknown) {
    super(OrganizationDefautWalletSettingsAlreadyExistsError.message, metadata)
  }
}

export class OrganizationDefautWalletSettingsNewLimitAboveLegalError extends ExceptionBase {
  static readonly message =
    'OrganizationDefautWalletSettings limit cannot be above legal limit'

  public readonly code: string = 'ORGANIZATION_WALLET.NEW_LIMIT_ABOVE_LEGAL'

  constructor(metadata?: unknown) {
    super(
      OrganizationDefautWalletSettingsNewLimitAboveLegalError.message,
      metadata,
    )
  }
}
