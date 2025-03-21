import { Provider } from '@nestjs/common'
import { Baas } from '../../infrastructure/baas/baas'
import { UnitOfWork } from '../../infrastructure/database/unit-of-work/unit-of-work'
import { EmployeeRepository } from '../organization/database/employee/employee.repository'
import { ActivateCardWhenTransactionActivatePhysicalCardDomainEventHandler } from './application/event-handlers/activate-card-when-transaction-activate-physical-card.domain-event-handler'
import { BlockDestroyedCardWhenEmployeeIsDeletedDomainEventHandler } from './application/event-handlers/block-card-when-employee-is-deleted.domain-event-handler'
import { CreateNewVirtualCardWhenCardIsDestroyedDomainEventHandler } from './application/event-handlers/create-new-virtual-card-when-card-is-destroyed.domain-event-handler'
import { CreateNewVirtualCardWhenCardIsLostDomainEventHandler } from './application/event-handlers/create-new-virtual-card-when-card-is-lost.domain-event-handler'
import { CreateNewVirtualCardWhenCardIsStolenDomainEventHandler } from './application/event-handlers/create-new-virtual-card-when-card-is-stolen.domain-event-handler'
import { CardRepository } from './database/card/card.repository'

export const cardProviders: Provider[] = [
  {
    provide: BlockDestroyedCardWhenEmployeeIsDeletedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
      baas: Baas,
    ): BlockDestroyedCardWhenEmployeeIsDeletedDomainEventHandler => {
      const eventHandler =
        new BlockDestroyedCardWhenEmployeeIsDeletedDomainEventHandler(
          unitOfWork,
          baas,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork, Baas],
  },
  {
    provide: ActivateCardWhenTransactionActivatePhysicalCardDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
      baas: Baas,
    ): ActivateCardWhenTransactionActivatePhysicalCardDomainEventHandler => {
      const eventHandler =
        new ActivateCardWhenTransactionActivatePhysicalCardDomainEventHandler(
          unitOfWork,
          baas,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork, Baas],
  },
  {
    provide: CreateNewVirtualCardWhenCardIsDestroyedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
      employeeRepo: EmployeeRepository,
      cardRepo: CardRepository,
      baas: Baas,
    ): CreateNewVirtualCardWhenCardIsDestroyedDomainEventHandler => {
      const eventHandler =
        new CreateNewVirtualCardWhenCardIsDestroyedDomainEventHandler(
          unitOfWork,
          employeeRepo,
          cardRepo,
          baas,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork, EmployeeRepository, CardRepository, Baas],
  },
  {
    provide: CreateNewVirtualCardWhenCardIsStolenDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
      employeeRepo: EmployeeRepository,
      cardRepo: CardRepository,
      baas: Baas,
    ): CreateNewVirtualCardWhenCardIsStolenDomainEventHandler => {
      const eventHandler =
        new CreateNewVirtualCardWhenCardIsStolenDomainEventHandler(
          unitOfWork,
          employeeRepo,
          cardRepo,
          baas,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork, EmployeeRepository, CardRepository, Baas],
  },
  {
    provide: CreateNewVirtualCardWhenCardIsLostDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
      employeeRepo: EmployeeRepository,
      cardRepo: CardRepository,
      baas: Baas,
    ): CreateNewVirtualCardWhenCardIsLostDomainEventHandler => {
      const eventHandler =
        new CreateNewVirtualCardWhenCardIsLostDomainEventHandler(
          unitOfWork,
          employeeRepo,
          cardRepo,
          baas,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork, EmployeeRepository, CardRepository, Baas],
  },
]
