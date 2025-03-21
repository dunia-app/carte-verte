import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BaasModule } from '../../infrastructure/baas/baas.module'
import { PaymentServiceModule } from '../../infrastructure/payment-service/payment-service.module'
import { MessageModule } from '../message/message.module'
import { OrganizationModule } from '../organization/organization.module'
import { cardProviders } from './card.providers'
import { ActivatePhysicalCardCommandHandler } from './commands/activate-physical-card/activate-physical-card.command-handler'
import { ActivatePhysicalCardGraphqlResolver } from './commands/activate-physical-card/activate-physical-card.resolver'
import { BlockDestroyedCardCommandHandler } from './commands/block-destroyed-card/block-destroyed-card.command-handler'
import { BlockDestroyedCardGraphqlResolver } from './commands/block-destroyed-card/block-destroyed-card.resolver'
import { BlockLostCardCommandHandler } from './commands/block-lost-card/block-lost-card.command-handler'
import { BlockLostCardGraphqlResolver } from './commands/block-lost-card/block-lost-card.resolver'
import { BlockStolenCardCommandHandler } from './commands/block-stolen-card/block-stolen-card.command-handler'
import { BlockStolenCardGraphqlResolver } from './commands/block-stolen-card/block-stolen-card.resolver'
import { ChangePinCommandHandler } from './commands/change-pin/change-pin.command-handler'
import { ChangePinGraphqlResolver } from './commands/change-pin/change-pin.resolver'
import { ConfirmCardPaymentCommandHandler } from './commands/confirm-card-payment/confirm-card-payment.command-handler'
import { ConvertToPhysicalCardCommandHandler } from './commands/convert-to-physical-card/convert-to-physical-card.command-handler'
import { CreateVirtualCardAdminGraphqlResolver } from './commands/create-virtual-card/create-virtual-card-admin.resolver'
import { CreateVirtualCardCommandHandler } from './commands/create-virtual-card/create-virtual-card.command-handler'
import { CreateVirtualCardGraphqlResolver } from './commands/create-virtual-card/create-virtual-card.resolver'
import { ExpireCardPaymentCommandHandler } from './commands/expire-card-payment/expire-card-payment.command-handler'
import { ExpirePhysicalCardRequestCommandHandler } from './commands/expire-physical-card-request/expire-physical-card-request.command-handler'
import { InitiateCardDigitalizationCommandHandler } from './commands/initiate-card-digitalization/initiate-card-digitalization.command-handler'
import { InitiateCardDigitalizationGraphqlResolver } from './commands/initiate-card-digitalization/initiate-card-digitalization.resolver'
import { LockCardCommandHandler } from './commands/lock-card/lock-card.command-handler'
import { LockCardGraphqlResolver } from './commands/lock-card/lock-card.resolver'
import { RequestPhysicalCardAdminGraphqlResolver } from './commands/request-physical-card-admin/request-physical-card-admin.resolver'
import { RequestPhysicalCardCommandHandler } from './commands/request-physical-card/request-physical-card.command-handler'
import { RequestPhysicalCardGraphqlResolver } from './commands/request-physical-card/request-physical-card.resolver'
import { ResetPinCommandHandler } from './commands/reset-pin/reset-pin.command-handler'
import { ResetPinGraphqlResolver } from './commands/reset-pin/reset-pin.resolver'
import { SetPinCommandHandler } from './commands/set-pin/set-pin.command-handler'
import { UnlockCardCommandHandler } from './commands/unlock-card/unlock-card.command-handler'
import { UnlockCardGraphqlResolver } from './commands/unlock-card/unlock-card.resolver'
import { UnlockPinCommandHandler } from './commands/unlock-pin/unlock-pin.command-handler'
import { UnlockPinGraphqlResolver } from './commands/unlock-pin/unlock-pin.resolver'
import { UpdateCardDigitalizationCommandHandler } from './commands/update-card-digitalization/update-card-digitalization.command-handler'
import { UpdateCardLimitAdminCommandHandler } from './commands/update-card-limit-admin/update-card-limit-admin.command-handler'
import { UpdateCardLimitAdminGraphqlResolver } from './commands/update-card-limit-admin/update-card-limit-admin.resolver'
import { UpdateCardLockStatusCommandHandler } from './commands/update-card-lock-status/update-card-lock-status.command-handler'
import { UpdateCardOptionsAdminCommandHandler } from './commands/update-card-options-admin/update-card-options-admin.command-handler'
import { UpdateCardOptionsAdminGraphqlResolver } from './commands/update-card-options-admin/update-card-options-admin.resolver'
import { UpdateCardPinTryExceededCommandHandler } from './commands/update-card-pin-try-exceeded/update-card-pin-try-exceeded.command-handler'
import { CardPaymentOrmEntity } from './database/card-payment/card-payment.orm-entity'
import { CardPaymentRepository } from './database/card-payment/card-payment.repository'
import { CardOrmEntity } from './database/card/card.orm-entity'
import { CardRepository } from './database/card/card.repository'
import { DisplayCardQueryHandler } from './queries/display-card/display-card.query-handler'
import { DisplayCardGraphqlResolver } from './queries/display-card/display-card.resolver'
import { FindCardQueryHandler } from './queries/find-card/find-card.query-handler'
import { FindCardGraphqlResolver } from './queries/find-card/find-card.resolver'

const graphqlResolvers = [
  ActivatePhysicalCardGraphqlResolver,
  BlockDestroyedCardGraphqlResolver,
  BlockLostCardGraphqlResolver,
  BlockStolenCardGraphqlResolver,
  ChangePinGraphqlResolver,
  CreateVirtualCardAdminGraphqlResolver,
  CreateVirtualCardGraphqlResolver,
  DisplayCardGraphqlResolver,
  FindCardGraphqlResolver,
  InitiateCardDigitalizationGraphqlResolver,
  LockCardGraphqlResolver,
  RequestPhysicalCardAdminGraphqlResolver,
  RequestPhysicalCardGraphqlResolver,
  ResetPinGraphqlResolver,
  UnlockCardGraphqlResolver,
  UnlockPinGraphqlResolver,
  UpdateCardLimitAdminGraphqlResolver,
  UpdateCardOptionsAdminGraphqlResolver,
]

const repositories = [CardRepository, CardPaymentRepository]

const commandHandlers = [
  ActivatePhysicalCardCommandHandler,
  BlockDestroyedCardCommandHandler,
  BlockLostCardCommandHandler,
  BlockStolenCardCommandHandler,
  ChangePinCommandHandler,
  ConvertToPhysicalCardCommandHandler,
  ConfirmCardPaymentCommandHandler,
  CreateVirtualCardCommandHandler,
  ExpireCardPaymentCommandHandler,
  ExpirePhysicalCardRequestCommandHandler,
  InitiateCardDigitalizationCommandHandler,
  LockCardCommandHandler,
  RequestPhysicalCardCommandHandler,
  ResetPinCommandHandler,
  SetPinCommandHandler,
  UnlockCardCommandHandler,
  UnlockPinCommandHandler,
  UpdateCardDigitalizationCommandHandler,
  UpdateCardLockStatusCommandHandler,
  UpdateCardPinTryExceededCommandHandler,
  UpdateCardLimitAdminCommandHandler,
  UpdateCardOptionsAdminCommandHandler,
]

const eventHandlers = [...cardProviders]

// const taskHandlers = []

const queryHandlers = [DisplayCardQueryHandler, FindCardQueryHandler]

@Module({
  imports: [
    TypeOrmModule.forFeature([CardOrmEntity, CardPaymentOrmEntity]),
    CqrsModule,
    BaasModule,
    PaymentServiceModule,
    forwardRef(() => MessageModule),
    forwardRef(() => OrganizationModule),
  ],
  controllers: [],
  providers: [
    ...repositories,
    ...graphqlResolvers,
    ...commandHandlers,
    ...eventHandlers,
    // ...taskHandlers,
    ...queryHandlers,
  ],
  exports: [...repositories],
})
export class CardModule {}
