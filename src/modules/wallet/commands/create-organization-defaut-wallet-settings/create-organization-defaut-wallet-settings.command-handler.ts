import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { OrganizationDefautWalletSettingsRepositoryPort } from '../../database/organization-defaut-wallet-settings/organization-defaut-wallet-settings.repository.port'
import { OrganizationDefautWalletSettingsEntity } from '../../domain/entities/organization-defaut-wallet-settings.entity'
import { OrganizationDefautWalletSettingsAlreadyExistsError } from '../../errors/organization-defaut-wallet-settings.errors'
import { CreateOrganizationDefautWalletSettingsCommand } from './create-organization-defaut-wallet-settings.command'

const defaultWalletName = 'My Wallet'
@CommandHandler(CreateOrganizationDefautWalletSettingsCommand)
export class CreateOrganizationDefautWalletSettingsCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: CreateOrganizationDefautWalletSettingsCommand,
  ): Promise<Result<UUID, OrganizationDefautWalletSettingsAlreadyExistsError>> {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const organizationDefautWalletSettingsRepo: OrganizationDefautWalletSettingsRepositoryPort =
      this.unitOfWork.getOrganizationDefautWalletSettingsRepository(
        command.correlationId,
      )
    // organizationDefautWalletSettings uniqueness guard
    if (
      await organizationDefautWalletSettingsRepo.exists(
        command.organizationId.value,
      )
    ) {
      /** Returning an Error instead of throwing it
       *  so a controller can handle it explicitly */
      return Result.err(
        new OrganizationDefautWalletSettingsAlreadyExistsError(),
      )
    }

    const organizationDefautWalletSettings =
      OrganizationDefautWalletSettingsEntity.create({
        organizationId: command.organizationId,
        name: defaultWalletName,
      })

    const created = await organizationDefautWalletSettingsRepo.save(
      organizationDefautWalletSettings,
    )
    return Result.ok(created.id)
  }
}
