import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { DomainEventHandler } from '../../../../libs/ddd/domain/domain-events/index'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { OrganizationCreatedDomainEvent } from '../../../organization/domain/events/organization-created.domain-event'
import { OrganizationDefautWalletSettingsRepositoryPort } from '../../database/organization-defaut-wallet-settings/organization-defaut-wallet-settings.repository.port'
import { OrganizationDefautWalletSettingsEntity } from '../../domain/entities/organization-defaut-wallet-settings.entity'

const defaultWalletName = 'My Wallet'
export class CreateOrganizationDefautWalletSettingsWhenOrganizationIsCreatedDomainEventHandler extends DomainEventHandler {
  constructor(private readonly unitOfWork: UnitOfWork) {
    super(OrganizationCreatedDomainEvent)
  }

  // Handle a Domain Event by perform changes to other aggregates (inside the same Domain).
  async handle(events: OrganizationCreatedDomainEvent[]): Promise<void> {
    for (const event of events) {
      if(!event.correlationId){
        throw new Error('CorrelationId is required');
      }

      const organizationDefautWalletSettingsRepo: OrganizationDefautWalletSettingsRepositoryPort =
        this.unitOfWork.getOrganizationDefautWalletSettingsRepository(
          event.correlationId,
        )
      // organizationDefautWalletSettings uniqueness guard
      if (
        await organizationDefautWalletSettingsRepo.exists(event.aggregateId)
      ) {
        return
      }

      const organizationDefautWalletSettings =
        OrganizationDefautWalletSettingsEntity.create({
          organizationId: new UUID(event.aggregateId),
          name: defaultWalletName,
        })

      await organizationDefautWalletSettingsRepo.save(
        organizationDefautWalletSettings,
      )
    }
  }
}
