import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { logger } from '../../../helpers/application.helper'
import { TypeormUnitOfWork } from '../../../libs/ddd/infrastructure/database/base-classes/typeorm-unit-of-work'
import { CardPaymentOrmEntity } from '../../../modules/card/database/card-payment/card-payment.orm-entity'
import { CardPaymentRepository } from '../../../modules/card/database/card-payment/card-payment.repository'
import { CardOrmEntity } from '../../../modules/card/database/card/card.orm-entity'
import { CardRepository } from '../../../modules/card/database/card/card.repository'
import { AdvantageMerchantCategoryOrmEntity } from '../../../modules/merchant/database/advantage-merchant-category/advantage-merchant-category.orm-entity'
import { AdvantageMerchantCategoryRepository } from '../../../modules/merchant/database/advantage-merchant-category/advantage-merchant-category.repository'
import { AdvantageOrmEntity } from '../../../modules/merchant/database/advantage/advantage.orm-entity'
import { AdvantageRepository } from '../../../modules/merchant/database/advantage/advantage.repository'
import { MerchantCategoryOrmEntity } from '../../../modules/merchant/database/merchant-category/merchant-category.orm-entity'
import { MerchantCategoryRepository } from '../../../modules/merchant/database/merchant-category/merchant-category.repository'
import { MerchantMerchantOrganizationOrmEntity } from '../../../modules/merchant/database/merchant-merchant-organization/merchant-merchant-organization.orm-entity'
import { MerchantMerchantOrganizationRepository } from '../../../modules/merchant/database/merchant-merchant-organization/merchant-merchant-organization.repository'
import { MerchantOrganizationOrmEntity } from '../../../modules/merchant/database/merchant-organization/merchant-organization.orm-entity'
import { MerchantOrganizationRepository } from '../../../modules/merchant/database/merchant-organization/merchant-organization.repository'
import { MerchantOrmEntity } from '../../../modules/merchant/database/merchant/merchant.orm-entity'
import { MerchantRepository } from '../../../modules/merchant/database/merchant/merchant.repository'
import { MessageOrmEntity } from '../../../modules/message/database/message/message.orm-entity'
import { MessageRepository } from '../../../modules/message/database/message/message.repository'
import { NotificationOrmEntity } from '../../../modules/message/database/notification/notification.orm-entity'
import { NotificationRepository } from '../../../modules/message/database/notification/notification.repository'
import { ReceiverOrmEntity } from '../../../modules/message/database/receiver/receiver.orm-entity'
import { ReceiverRepository } from '../../../modules/message/database/receiver/receiver.repository'
import { TemplateOrmEntity } from '../../../modules/message/database/template/template.orm-entity'
import { TemplateRepository } from '../../../modules/message/database/template/template.repository'
import { EmployeeOrmEntity } from '../../../modules/organization/database/employee/employee.orm-entity'
import { EmployeeRepository } from '../../../modules/organization/database/employee/employee.repository'
import { OrganizationAdminOrmEntity } from '../../../modules/organization/database/organization-admin/organization-admin.orm-entity'
import { OrganizationAdminRepository } from '../../../modules/organization/database/organization-admin/organization-admin.repository'
import { OrganizationOrmEntity } from '../../../modules/organization/database/organization/organization.orm-entity'
import { OrganizationRepository } from '../../../modules/organization/database/organization/organization.repository'
import { TransactionOrmEntity } from '../../../modules/transaction/database/transaction/transaction.orm-entity'
import { TransactionRepository } from '../../../modules/transaction/database/transaction/transaction.repository'
import { TransferOrmEntity } from '../../../modules/transaction/database/transfer/transfer.orm-entity'
import { TransferRepository } from '../../../modules/transaction/database/transfer/transfer.repository'
import { SuperAdminOrmEntity } from '../../../modules/user/database/super-admin/super-admin.orm-entity'
import { SuperAdminRepository } from '../../../modules/user/database/super-admin/super-admin.repository'
import { UserOrmEntity } from '../../../modules/user/database/user/user.orm-entity'
import { UserRepository } from '../../../modules/user/database/user/user.repository'
import { CardAcquisitionPayinOrmEntity } from '../../../modules/wallet/database/card-acquisition-payin/card-acquisition-payin.orm-entity'
import { CardAcquisitionPayinRepository } from '../../../modules/wallet/database/card-acquisition-payin/card-acquisition-payin.repository'
import { CardAcquisitionOrmEntity } from '../../../modules/wallet/database/card-acquisition/card-acquisition.orm-entity'
import { CardAcquisitionRepository } from '../../../modules/wallet/database/card-acquisition/card-acquisition.repository'
import { ExternalValidationOrmEntity } from '../../../modules/wallet/database/external-validation/external-validation.orm-entity'
import { ExternalValidationRepository } from '../../../modules/wallet/database/external-validation/external-validation.repository'
import { OrganizationDefautWalletSettingsOrmEntity } from '../../../modules/wallet/database/organization-defaut-wallet-settings/organization-defaut-wallet-settings.orm-entity'
import { OrganizationDefautWalletSettingsRepository } from '../../../modules/wallet/database/organization-defaut-wallet-settings/organization-defaut-wallet-settings.repository'
import { WalletOrmEntity } from '../../../modules/wallet/database/wallet/wallet.orm-entity'
import { WalletRepository } from '../../../modules/wallet/database/wallet/wallet.repository'
import { ConfigService } from '../../config/config.service'
import { WebhookOrmEntity } from '../../webhook-listener/database/webhook.orm-entity'
import { WebhookRepository } from '../../webhook-listener/database/webhook.repository'

@Injectable()
export class UnitOfWork extends TypeormUnitOfWork {
  config: ConfigService
  constructor(dataSource: DataSource, config: ConfigService) {
    super(logger, dataSource)
    this.config = config
  }
  // Add new repositories below to use this generic UnitOfWork
  // Convert TypeOrm Repository to a Domain Repository

  getWebhookRepository(correlationId: string): WebhookRepository {
    return new WebhookRepository(
      this.getOrmRepository(WebhookOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  // Card Module
  getCardRepository(correlationId: string): CardRepository {
    return new CardRepository(
      this.getOrmRepository(CardOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }
  getCardPaymentRepository(correlationId: string): CardPaymentRepository {
    return new CardPaymentRepository(
      this.getOrmRepository(CardPaymentOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  // Message Module
  getMessageRepository(correlationId: string): MessageRepository {
    return new MessageRepository(
      this.getOrmRepository(MessageOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getNotificationRepository(correlationId: string): NotificationRepository {
    return new NotificationRepository(
      this.getOrmRepository(NotificationOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getTemplateRepository(correlationId: string): TemplateRepository {
    return new TemplateRepository(
      this.getOrmRepository(TemplateOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getReceiverRepository(correlationId: string): ReceiverRepository {
    return new ReceiverRepository(
      this.getOrmRepository(ReceiverOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  // Organization Module
  getOrganizationRepository(correlationId: string): OrganizationRepository {
    return new OrganizationRepository(
      this.getOrmRepository(OrganizationOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getEmployeeRepository(correlationId: string): EmployeeRepository {
    return new EmployeeRepository(
      this.getOrmRepository(EmployeeOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getOrganizationAdminRepository(
    correlationId: string,
  ): OrganizationAdminRepository {
    return new OrganizationAdminRepository(
      this.getOrmRepository(OrganizationAdminOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  // Transaction Module
  getAdvantageRepository(correlationId: string): AdvantageRepository {
    return new AdvantageRepository(
      this.getOrmRepository(AdvantageOrmEntity, correlationId),
      this.getMerchantRepository(correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getAdvantageMerchantCategoryRepository(
    correlationId: string,
  ): AdvantageMerchantCategoryRepository {
    return new AdvantageMerchantCategoryRepository(
      this.getOrmRepository(AdvantageMerchantCategoryOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getTransactionRepository(correlationId: string): TransactionRepository {
    return new TransactionRepository(
      this.getOrmRepository(TransactionOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getTransferRepository(correlationId: string): TransferRepository {
    return new TransferRepository(
      this.getOrmRepository(TransferOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getMerchantRepository(correlationId: string): MerchantRepository {
    return new MerchantRepository(
      this.getOrmRepository(MerchantOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getMerchantCategoryRepository(
    correlationId: string,
  ): MerchantCategoryRepository {
    return new MerchantCategoryRepository(
      this.getOrmRepository(MerchantCategoryOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getMerchantOrganizationRepository(
    correlationId: string,
  ): MerchantOrganizationRepository {
    return new MerchantOrganizationRepository(
      this.getOrmRepository(MerchantOrganizationOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getMerchantMerchantOrganizationRepository(
    correlationId: string,
  ): MerchantMerchantOrganizationRepository {
    return new MerchantMerchantOrganizationRepository(
      this.getOrmRepository(
        MerchantMerchantOrganizationOrmEntity,
        correlationId,
      ),
      this.config,
    ).setCorrelationId(correlationId)
  }

  // User Module
  getUserRepository(correlationId: string): UserRepository {
    return new UserRepository(
      this.getOrmRepository(UserOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getSuperAdminRepository(correlationId: string): SuperAdminRepository {
    return new SuperAdminRepository(
      this.getOrmRepository(SuperAdminOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  // Wallet Module
  getOrganizationDefautWalletSettingsRepository(
    correlationId: string,
  ): OrganizationDefautWalletSettingsRepository {
    return new OrganizationDefautWalletSettingsRepository(
      this.getOrmRepository(
        OrganizationDefautWalletSettingsOrmEntity,
        correlationId,
      ),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getWalletRepository(correlationId: string): WalletRepository {
    return new WalletRepository(
      this.getOrmRepository(WalletOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getExternalValidationRepository(
    correlationId: string,
  ): ExternalValidationRepository {
    return new ExternalValidationRepository(
      this.getOrmRepository(ExternalValidationOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getCardAcquisitionRepository(
    correlationId: string,
  ): CardAcquisitionRepository {
    return new CardAcquisitionRepository(
      this.getOrmRepository(CardAcquisitionOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }

  getCardAcquisitionPayinRepository(
    correlationId: string,
  ): CardAcquisitionPayinRepository {
    return new CardAcquisitionPayinRepository(
      this.getOrmRepository(CardAcquisitionPayinOrmEntity, correlationId),
      this.config,
    ).setCorrelationId(correlationId)
  }
}
