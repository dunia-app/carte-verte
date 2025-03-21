import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BaasModule } from '../../infrastructure/baas/baas.module'
import { CardModule } from '../card/card.module'
import { MerchantModule } from '../merchant/merchant.module'
import { MessageModule } from '../message/message.module'
import { OrganizationModule } from '../organization/organization.module'
import { TransactionModule } from '../transaction/transaction.module'
import { AuthorizePendingCardAcquisitionPayinTaskHandler } from './application/task-handlers/authorize-pending-card-acquisition-payin.task-handler'
import { ExpirePendingAcceptedTransactionsTaskHandler } from './application/task-handlers/expire-pending-accepted-transactions.task-handler'
import { RenewCardAcquisitionPayinTaskHandler } from './application/task-handlers/renew-card-acquisition-payin.task-handler'
import { AcceptTansactionCommandHandler } from './commands/accept-transaction/accept-transaction.command-handler'
import { TransactionsExternalValidationController } from './commands/accept-transaction/accept-transaction.controller'
import { AffectBalanceTransactionCommandHandler } from './commands/affect-balance-transaction/affect-balance-transaction.command-handler'
import { AffectBalanceTransferCommandHandler } from './commands/affect-balance-transfer/affect-balance-transfer.command-handler'
import { AuthorizeCardAcquisitionPayinAdminGraphqlResolver } from './commands/authorize-card-acquisition-payin/authorize-card-acquisition-payin-admin.resolver'
import { AuthorizeCardAcquisitionPayinCommandHandler } from './commands/authorize-card-acquisition-payin/authorize-card-acquisition-payin.command-handler'
import { AuthorizePendingCardAcquisitionPayinCommandHandler } from './commands/authorized-pending-card-acquisition-payin/authorized-pending-card-acquisition-payin.command-handler'
import { AuthorizePendingCardAcquisitionPayinController } from './commands/authorized-pending-card-acquisition-payin/authorized-pending-card-acquisition-payin.task.controller'
import { AuthorizePendingCardAcquisitionCommandHandler } from './commands/authorized-pending-card-acquisition/authorized-pending-card-acquisition.command-handler'
import { AuthorizePendingCardAcquisitionController } from './commands/authorized-pending-card-acquisition/authorized-pending-card-acquisition.task.controller'
import { CancelCardAcquisitionCommandHandler } from './commands/cancel-card-acquisition/cancel-card-acquisition.command-handler'
import { CancelCardAcquisitionGraphqlResolver } from './commands/cancel-card-acquisition/cancel-card-acquisition.resolver'
import { CaptureCardAcquisitionPayinAdminGraphqlResolver } from './commands/capture-card-acquisition-payin/capture-card-acquisition-payin-admin.resolver'
import { CaptureCardAcquisitionPayinCommandHandler } from './commands/capture-card-acquisition-payin/capture-card-acquisition-payin.command-handler'
import { CaptureUncapturedTransactionGraphqlResolver } from './commands/capture-uncaptured-transaction/capture-uncaptured-transaction-admin.resolver'
import { CaptureUncapturedTransactionCommandHandler } from './commands/capture-uncaptured-transaction/capture-uncaptured-transaction.command-handler'
import { CreateBaasAcquisitionsCommandHandler } from './commands/create-baas-acquisitions/create-baas-acquisitions.command-handler'
import { CreateBaasAcquisitionsResolver } from './commands/create-baas-acquisitions/create-baas-acquisitions.resolver'
import { CreateOrganizationDefautWalletSettingsCommandHandler } from './commands/create-organization-defaut-wallet-settings/create-organization-defaut-wallet-settings.command-handler'
import { CreateWalletCommandHandler } from './commands/create-wallet/create-wallet.command-handler'
import { CreditWalletDevCommandHandler } from './commands/credit-wallet-dev/credit-wallet-dev.command-handler'
import { CreditWalletDevGraphqlResolver } from './commands/credit-wallet-dev/credit-wallet-dev.resolver'
import { ExpirePendingAcceptedTransactionsCommandHandler } from './commands/expire-pending-accepted-transactions/expire-pending-accepted-transactions.command-handler'
import { ExpirePendingAcceptedTransactionsController } from './commands/expire-pending-accepted-transactions/expire-pending-accepted-transactions.task.controller'
import { RenewCardAcquisitionPayinCommandHandler } from './commands/renew-card-acquisition-payin/renew-card-acquisition-payin.command-handler'
import { RenewCardAcquisitionPayinController } from './commands/renew-card-acquisition-payin/renew-card-acquisition-payin.task.controller'
import { RequestExternalCardAcquisitionLinkCommandHandler } from './commands/request-external-card-acquisition-link/request-external-card-acquisition-link.command-handler'
import { RequestExternalCardAcquisitionLinkGraphqlResolver } from './commands/request-external-card-acquisition-link/request-external-card-acquisition-link.resolver'
import { UpdateCardAcquisitionOverdraftCommandHandler } from './commands/update-card-acquisition-overdraft/update-card-acquisition-overdraft.command-handler'
import { UpdateCardAcquisitionOverdraftGraphqlResolver } from './commands/update-card-acquisition-overdraft/update-card-acquisition-overdraft.resolver'
import { ValidateCardAcquisitionPayinCaptureCommandHandler } from './commands/validate-card-acquisition-payin-capture/validate-card-acquisition-payin-capture.command-handler'
import { ValidateCardAcquisitionAdminGraphqlResolver } from './commands/validate-card-acquisition/validate-card-acquisition-admin.resolver'
import { ValidateCardAcquisitionCommandHandler } from './commands/validate-card-acquisition/validate-card-acquisition.command-handler'
import { ValidateCardAcquisitionController } from './commands/validate-card-acquisition/validate-card-acquisition.controller'
import { ValidateCardAcquisitionGraphqlResolver } from './commands/validate-card-acquisition/validate-card-acquisition.resolver'
import { CardAcquisitionPayinOrmEntity } from './database/card-acquisition-payin/card-acquisition-payin.orm-entity'
import { CardAcquisitionPayinRepository } from './database/card-acquisition-payin/card-acquisition-payin.repository'
import { CardAcquisitionOrmEntity } from './database/card-acquisition/card-acquisition.orm-entity'
import { CardAcquisitionRepository } from './database/card-acquisition/card-acquisition.repository'
import { ExternalValidationOrmEntity } from './database/external-validation/external-validation.orm-entity'
import { ExternalValidationRepository } from './database/external-validation/external-validation.repository'
import { OrganizationDefautWalletSettingsOrmEntity } from './database/organization-defaut-wallet-settings/organization-defaut-wallet-settings.orm-entity'
import { OrganizationDefautWalletSettingsRepository } from './database/organization-defaut-wallet-settings/organization-defaut-wallet-settings.repository'
import { WalletOrmEntity } from './database/wallet/wallet.orm-entity'
import { WalletRepository } from './database/wallet/wallet.repository'
import { CashbackSumQueryHandler } from './queries/cashback-sum/cashback-sum.query-handler'
import { CashbackSumGraphqlResolver } from './queries/cashback-sum/cashback-sum.resolver'
import { FindCardAcquisitionQueryHandler } from './queries/find-card-acquisition/find-card-acquisition.query-handler'
import { FindCardAcquisitionGraphqlResolver } from './queries/find-card-acquisition/find-card-acquisition.resolver'
import { FindWalletLimitQueryHandler } from './queries/find-wallet-limit/find-wallet-limit.query-handler'
import { FindWalletQueryHandler } from './queries/find-wallet/find-wallet.query-handler'
import { FindWalletGraphqlResolver } from './queries/find-wallet/find-wallet.resolver'
import { walletProviders } from './wallet.providers'

const controllers = [
  AuthorizePendingCardAcquisitionController,
  AuthorizePendingCardAcquisitionPayinController,
  ExpirePendingAcceptedTransactionsController,
  TransactionsExternalValidationController,
  ValidateCardAcquisitionController,
  RenewCardAcquisitionPayinController,
]

const repositories = [
  CardAcquisitionRepository,
  CardAcquisitionPayinRepository,
  ExternalValidationRepository,
  OrganizationDefautWalletSettingsRepository,
  WalletRepository,
]

const graphqlResolvers = [
  AuthorizeCardAcquisitionPayinAdminGraphqlResolver,
  CancelCardAcquisitionGraphqlResolver,
  CashbackSumGraphqlResolver,
  CaptureCardAcquisitionPayinAdminGraphqlResolver,
  CaptureUncapturedTransactionGraphqlResolver,
  CreateBaasAcquisitionsResolver,
  CreditWalletDevGraphqlResolver,
  FindCardAcquisitionGraphqlResolver,
  FindWalletGraphqlResolver,
  RequestExternalCardAcquisitionLinkGraphqlResolver,
  UpdateCardAcquisitionOverdraftGraphqlResolver,
  ValidateCardAcquisitionAdminGraphqlResolver,
  ValidateCardAcquisitionGraphqlResolver,
]

const commandHandlers = [
  AuthorizeCardAcquisitionPayinCommandHandler,
  AuthorizePendingCardAcquisitionCommandHandler,
  AuthorizePendingCardAcquisitionPayinCommandHandler,
  AffectBalanceTransactionCommandHandler,
  AffectBalanceTransferCommandHandler,
  CancelCardAcquisitionCommandHandler,
  CaptureCardAcquisitionPayinCommandHandler,
  CaptureUncapturedTransactionCommandHandler,
  CreateBaasAcquisitionsCommandHandler,
  CreateOrganizationDefautWalletSettingsCommandHandler,
  CreateWalletCommandHandler,
  CreditWalletDevCommandHandler,
  AcceptTansactionCommandHandler,
  ExpirePendingAcceptedTransactionsCommandHandler,
  RenewCardAcquisitionPayinCommandHandler,
  RequestExternalCardAcquisitionLinkCommandHandler,
  UpdateCardAcquisitionOverdraftCommandHandler,
  ValidateCardAcquisitionCommandHandler,
  ValidateCardAcquisitionPayinCaptureCommandHandler,
]

const eventHandlers = [...walletProviders]

const taskHandlers = [
  ExpirePendingAcceptedTransactionsTaskHandler,
  RenewCardAcquisitionPayinTaskHandler,
  AuthorizePendingCardAcquisitionPayinTaskHandler,
]

const queryHandlers = [
  CashbackSumQueryHandler,
  FindCardAcquisitionQueryHandler,
  FindWalletLimitQueryHandler,
  FindWalletQueryHandler,
  FindWalletQueryHandler,
]

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CardAcquisitionOrmEntity,
      CardAcquisitionPayinOrmEntity,
      ExternalValidationOrmEntity,
      OrganizationDefautWalletSettingsOrmEntity,
      WalletOrmEntity,
    ]),
    CqrsModule,
    BaasModule,
    forwardRef(() => CardModule),
    forwardRef(() => MerchantModule),
    forwardRef(() => MessageModule),
    forwardRef(() => OrganizationModule),
    forwardRef(() => TransactionModule),
  ],
  controllers: [...controllers],
  providers: [
    ...repositories,
    ...graphqlResolvers,
    ...commandHandlers,
    ...eventHandlers,
    ...taskHandlers,
    ...queryHandlers,
  ],
  exports: [...repositories],
})
export class WalletModule {}
