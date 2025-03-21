import { Provider } from '@nestjs/common'
import { ConfigService } from '../../infrastructure/config/config.service'
import { UnitOfWork } from '../../infrastructure/database/unit-of-work/unit-of-work'
import { MessageEmitter } from '../../infrastructure/message-emitter/message-emitter'
import { RedisService } from '../../infrastructure/redis/redis.service'
import { SmsEmitter } from '../../infrastructure/sms-emitter/sms-emitter'
import { SendCashbackNotifWhenCashbackTransferIsCreatedDomainEventHandler } from './application/event-handlers/send-cashback-notif-when-cashback-transfer-is-created.domain-event-handler'
import { SendEmployeeFrozenNotifWhenEmployeeIsFrozenDomainEventHandler } from './application/event-handlers/send-frozen-notif-when-employee-is-frozen.domain-event-handler'
import { SendLoginTokenEmailWhenEmployeeAskNewLoginTokenDomainEventHandler } from './application/event-handlers/send-login-token-email-when-employee-ask-new-login-token.domain-event-handler'
import { SendLoginTokenEmailWhenEmployeeAskResetCodeDomainEventHandler } from './application/event-handlers/send-login-token-email-when-employee-ask-reset-code.domain-event-handler'
import { SendPhysicalCardMailWhenPhysicalCardIsRequestedDomainEventHandler } from './application/event-handlers/send-physical-card-mail-when-physical-card-is-requested.domain-event-handler'
import { SendPinChangedNotifWhenCardPinHasChangedDomainEventHandler } from './application/event-handlers/send-pin-changed-notif-when-card-pin-has-changed.domain-event-handler'
import { SendRegisterEmailWhenEmployeeIsCreatedDomainEventHandler } from './application/event-handlers/send-register-email-when-employee-is-created.domain-event-handler'
import { SendSmsTokenWhenEmployeeAskNewSmsTokenDomainEventHandler } from './application/event-handlers/send-sms-token-when-employee-ask-new-sms-token.domain-event-handler'
import { SendTransactionNotifWhenTransactionIsCreatedDomainEventHandler } from './application/event-handlers/send-transaction-notif-when-transaction-is-created.domain-event-handler'
import { SendEmployeeUnfrozenNotifWhenEmployeeIsUnfrozenDomainEventHandler } from './application/event-handlers/send-unfrozen-notif-when-employee-is-unfrozen.domain-event-handler'

/**
 * @module messageProviders
 * This module exports an array of providers for the message module.
 * Each provider is an object that includes the following properties:
 * - `provide`: The class that will be provided.
 * - `useFactory`: A factory function that returns an instance of the provided class.
 * - `inject`: An array of classes to inject into the factory function.
 * @type {Provider[]}
 */
export const messageProviders: Provider[] = [
  {
    provide: SendRegisterEmailWhenEmployeeIsCreatedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
    ): SendRegisterEmailWhenEmployeeIsCreatedDomainEventHandler => {
      const eventHandler =
        new SendRegisterEmailWhenEmployeeIsCreatedDomainEventHandler(unitOfWork)
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork, RedisService],
  },
  {
    provide: SendLoginTokenEmailWhenEmployeeAskResetCodeDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
      redis: RedisService,
      configService: ConfigService,
    ): SendLoginTokenEmailWhenEmployeeAskResetCodeDomainEventHandler => {
      const eventHandler =
        new SendLoginTokenEmailWhenEmployeeAskResetCodeDomainEventHandler(
          unitOfWork,
          redis,
          configService,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork, RedisService, ConfigService],
  },
  {
    provide: SendLoginTokenEmailWhenEmployeeAskNewLoginTokenDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
      redis: RedisService,
      configService: ConfigService,
    ): SendLoginTokenEmailWhenEmployeeAskNewLoginTokenDomainEventHandler => {
      const eventHandler =
        new SendLoginTokenEmailWhenEmployeeAskNewLoginTokenDomainEventHandler(
          unitOfWork,
          redis,
          configService,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork, RedisService, ConfigService],
  },
  {
    provide: SendSmsTokenWhenEmployeeAskNewSmsTokenDomainEventHandler,
    useFactory: (
      redis: RedisService,
      config: ConfigService,
      smsEmitter: SmsEmitter,
      messageEmitter: MessageEmitter,
    ): SendSmsTokenWhenEmployeeAskNewSmsTokenDomainEventHandler => {
      const eventHandler =
        new SendSmsTokenWhenEmployeeAskNewSmsTokenDomainEventHandler(
          redis,
          config,
          smsEmitter,
          messageEmitter,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [RedisService, ConfigService, SmsEmitter, MessageEmitter],
  },
  {
    provide: SendTransactionNotifWhenTransactionIsCreatedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
    ): SendTransactionNotifWhenTransactionIsCreatedDomainEventHandler => {
      const eventHandler =
        new SendTransactionNotifWhenTransactionIsCreatedDomainEventHandler(
          unitOfWork,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork],
  },
  {
    provide: SendCashbackNotifWhenCashbackTransferIsCreatedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
    ): SendCashbackNotifWhenCashbackTransferIsCreatedDomainEventHandler => {
      const eventHandler =
        new SendCashbackNotifWhenCashbackTransferIsCreatedDomainEventHandler(
          unitOfWork,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork],
  },
  {
    provide: SendPhysicalCardMailWhenPhysicalCardIsRequestedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
    ): SendPhysicalCardMailWhenPhysicalCardIsRequestedDomainEventHandler => {
      const eventHandler =
        new SendPhysicalCardMailWhenPhysicalCardIsRequestedDomainEventHandler(
          unitOfWork,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork],
  },
  {
    provide: SendPinChangedNotifWhenCardPinHasChangedDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
    ): SendPinChangedNotifWhenCardPinHasChangedDomainEventHandler => {
      const eventHandler =
        new SendPinChangedNotifWhenCardPinHasChangedDomainEventHandler(
          unitOfWork,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork],
  },
  {
    provide: SendEmployeeFrozenNotifWhenEmployeeIsFrozenDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
    ): SendEmployeeFrozenNotifWhenEmployeeIsFrozenDomainEventHandler => {
      const eventHandler =
        new SendEmployeeFrozenNotifWhenEmployeeIsFrozenDomainEventHandler(
          unitOfWork,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork],
  },
  {
    provide: SendEmployeeUnfrozenNotifWhenEmployeeIsUnfrozenDomainEventHandler,
    useFactory: (
      unitOfWork: UnitOfWork,
    ): SendEmployeeUnfrozenNotifWhenEmployeeIsUnfrozenDomainEventHandler => {
      const eventHandler =
        new SendEmployeeUnfrozenNotifWhenEmployeeIsUnfrozenDomainEventHandler(
          unitOfWork,
        )
      eventHandler.listen()
      return eventHandler
    },
    inject: [UnitOfWork],
  },
]
