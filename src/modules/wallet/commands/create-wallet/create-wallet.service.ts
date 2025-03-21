import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { isUndefined } from '../../../../libs/utils/is-undefined.util'
import { OrganizationDefautWalletSettingsRepositoryPort } from '../../database/organization-defaut-wallet-settings/organization-defaut-wallet-settings.repository.port'
import { WalletRepositoryPort } from '../../database/wallet/wallet.repository.port'
import { WalletEntity } from '../../domain/entities/wallet.entity'
import { CreateWalletCommand } from './create-wallet.command'

export async function createWallet(
  command: CreateWalletCommand,
  unitOfWork: UnitOfWork,
): Promise<Result<number, ExceptionBase>> {
  /* Use a repository provided by UnitOfWork to include everything 
    (including changes caused by Domain Events) into one 
    atomic database transaction */
  const organizationDefautWalletSettingsRepo: OrganizationDefautWalletSettingsRepositoryPort =
    unitOfWork.getOrganizationDefautWalletSettingsRepository(
      command.correlationId,
    )

  const organizationDefautWalletSettings =
    await organizationDefautWalletSettingsRepo.findOneByOrganizationIdOrThrow(
      command.organizationId,
    )
  const walletRepo: WalletRepositoryPort = unitOfWork.getWalletRepository(
    command.correlationId,
  )

  const walletToCreate = (
    await Promise.all(
      organizationDefautWalletSettings.advantageList.activatedAdvantages.map(
        async (advantage) => {
          const existingWallets =
            await walletRepo.findManyByEmployeeIdAdvantage(
              command.employeeIds,
              advantage,
            )
          if (existingWallets.length > 0) {
            /** Returning an Error instead of throwing it
             *  so a controller can handle it explicitly */
            return
          }
          return command.employeeIds.map((employeeId) =>
            WalletEntity.create({
              employeeId: new UUID(employeeId),
              name: command.name,
              advantage: advantage,
            }),
          )
        },
      ),
    )
  )
    .flat()
    .filter((wallet): wallet is WalletEntity => !isUndefined(wallet))

  const created = await walletRepo.saveMultiple(walletToCreate)
  return Result.ok(created.length)
}
