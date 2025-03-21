import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  OrganizationDefautWalletSettingsEntity,
  OrganizationDefautWalletSettingsProps,
} from '../../domain/entities/organization-defaut-wallet-settings.entity'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface OrganizationDefautWalletSettingsRepositoryPort
  extends RepositoryPort<
    OrganizationDefautWalletSettingsEntity,
    OrganizationDefautWalletSettingsProps
  > {
  findOneByOrganizationIdOrThrow(
    organizationId: string,
  ): Promise<OrganizationDefautWalletSettingsEntity>
  exists(organizationId: string): Promise<boolean>
}
