import { Provider } from '@nestjs/common'
import { Baas } from '../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../infrastructure/database/unit-of-work/unit-of-work'
import { AffectBalanceWhenTransactionIsCreatedDomainEventHandler } from './application/event-handlers/affect-balance-when-transaction-is-created.domain-event-handler'
import { AffectBalanceWhenTransferIsCreatedDomainEventHandler } from './application/event-handlers/affect-balance-when-transfer-is-created.domain-event-handler'
import { AffectExternalBalanceWhenCardAcquisitionPayinIsCapturedDomainEventHandler } from './application/event-handlers/affect-external-balance-when-card-acquisition-payin-is-captured.event-handler'
import { AuthorizeCardAcquisitionPayinWhenExternalWalletAuthorizedBalanceIsDebitedDomainEventHandler } from './application/event-handlers/authorize-card-acquisition-payin-when-external-wallet-authorized-balance-is-debited.event-handler'
import { CancelCardAcquisitionPayinWhenExternalWalletBalanceIsCreditedDomainEventHandler } from './application/event-handlers/cancel-card-acquisition-payin-when-external-wallet-authorized-balance-is-credited.event-handler'
import { CaptureCardAcquisitionPayinWhenExternalWalletBalanceIsDebitedDomainEventHandler } from './application/event-handlers/capture-card-acquisition-payin-when-external-wallet-balance-is-debited.event-handler'
import { CreateOrganizationDefautWalletSettingsWhenOrganizationIsCreatedDomainEventHandler } from './application/event-handlers/create-organization-defaut-wallet-settings-when-organization-is-created.domain-event-handler'
import { CreateWalletWhenEmployeeIsCreatedDomainEventHandler } from './application/event-handlers/create-wallet-when-employee-is-created.domain-event-handler'

export const walletProviders: Provider[] = [
  {
    provide:
      CreateOrganizationDefautWalletSettingsWhenOrganizationIsCreatedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
    ): CreateOrganizationDefautWalletSettingsWhenOrganizationIsCreatedDomainEventHandler => {
      const eventHandler =
        new CreateOrganizationDefautWalletSettingsWhenOrganizationIsCreatedDomainEventHandler(
          unitOfWork,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork],
  },
  {
    provide: CreateWalletWhenEmployeeIsCreatedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
    ): CreateWalletWhenEmployeeIsCreatedDomainEventHandler => {
      const eventHandler =
        new CreateWalletWhenEmployeeIsCreatedDomainEventHandler(unitOfWork)
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork],
  },
  {
    provide: AffectBalanceWhenTransactionIsCreatedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
    ): AffectBalanceWhenTransactionIsCreatedDomainEventHandler => {
      const eventHandler =
        new AffectBalanceWhenTransactionIsCreatedDomainEventHandler(unitOfWork)
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork],
  },
  {
    provide: AffectBalanceWhenTransferIsCreatedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
    ): AffectBalanceWhenTransferIsCreatedDomainEventHandler => {
      const eventHandler =
        new AffectBalanceWhenTransferIsCreatedDomainEventHandler(unitOfWork)
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork],
  },
  {
    provide:
      AuthorizeCardAcquisitionPayinWhenExternalWalletAuthorizedBalanceIsDebitedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
      cardAcquisition: CardAcquisitionService,
      baas: Baas,
    ): AuthorizeCardAcquisitionPayinWhenExternalWalletAuthorizedBalanceIsDebitedDomainEventHandler => {
      const eventHandler =
        new AuthorizeCardAcquisitionPayinWhenExternalWalletAuthorizedBalanceIsDebitedDomainEventHandler(
          unitOfWork,
          cardAcquisition,
          baas,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork, CardAcquisitionService, Baas],
  },
  {
    provide:
      CancelCardAcquisitionPayinWhenExternalWalletBalanceIsCreditedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
      baas: Baas,
      cardAcquisitionService: CardAcquisitionService,
    ): CancelCardAcquisitionPayinWhenExternalWalletBalanceIsCreditedDomainEventHandler => {
      const eventHandler =
        new CancelCardAcquisitionPayinWhenExternalWalletBalanceIsCreditedDomainEventHandler(
          unitOfWork,
          baas,
          cardAcquisitionService,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork, Baas, CardAcquisitionService],
  },
  {
    provide:
      CaptureCardAcquisitionPayinWhenExternalWalletBalanceIsDebitedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
      baas: Baas,
      cardAcquisitionService: CardAcquisitionService,
    ): CaptureCardAcquisitionPayinWhenExternalWalletBalanceIsDebitedDomainEventHandler => {
      const eventHandler =
        new CaptureCardAcquisitionPayinWhenExternalWalletBalanceIsDebitedDomainEventHandler(
          unitOfWork,
          baas,
          cardAcquisitionService,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork, Baas, CardAcquisitionService],
  },
  {
    provide:
      AffectExternalBalanceWhenCardAcquisitionPayinIsCapturedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
    ): AffectExternalBalanceWhenCardAcquisitionPayinIsCapturedDomainEventHandler => {
      const eventHandler =
        new AffectExternalBalanceWhenCardAcquisitionPayinIsCapturedDomainEventHandler(
          unitOfWork,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork],
  },
]
