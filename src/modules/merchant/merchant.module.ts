import { Module, forwardRef } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CsvModule } from 'nest-csv-parser'
import { MessageEmitterModule } from '../../infrastructure/message-emitter/message-emitter.module'
import { MerchantOrmEntity } from '../merchant/database/merchant/merchant.orm-entity'
import { MerchantRepository } from '../merchant/database/merchant/merchant.repository'
import { FindPointOfSalesQueryHandler } from '../merchant/queries/find-point-of-sales/find-point-of-sales.query-handler'
import { FindPointOfSalesGraphqlResolver } from '../merchant/queries/find-point-of-sales/find-point-of-sales.resolver'
import { OrganizationModule } from '../organization/organization.module'
import { WalletModule } from '../wallet/wallet.module'
import { UpdateMerchantMccTaskHandler } from './application/task-handlers/update-merchant-mcc.task-handler'
import { InsertMerchantWithSiretCommandHandler } from './commands/insert-merchant-with-siret/insert-merchant-with-siret.command-handler'
import { InsertMerchantWithSiretGraphqlResolver } from './commands/insert-merchant-with-siret/insert-merchant-with-siret.resolver'
import { UpdateMerchantMccCommandHandler } from './commands/update-merchant-mcc/update-merchant-mcc.command-handler'
import { UpdateMerchantMccController } from './commands/update-merchant-mcc/update-merchant-mcc.task.controller'
import { UpsertMerchantCommandHandler } from './commands/upsert-merchant/upsert-merchant.command-handler'
import { UpsertMerchantGraphqlResolver } from './commands/upsert-merchant/upsert-merchant.resolver'
import { AdvantageMerchantCategoryOrmEntity } from './database/advantage-merchant-category/advantage-merchant-category.orm-entity'
import { AdvantageMerchantCategoryRepository } from './database/advantage-merchant-category/advantage-merchant-category.repository'
import { AdvantageOrmEntity } from './database/advantage/advantage.orm-entity'
import { AdvantageRepository } from './database/advantage/advantage.repository'
import { CityOrmEntity } from './database/city/city.orm-entity'
import { MerchantCategoryOrmEntity } from './database/merchant-category/merchant-category.orm-entity'
import { MerchantCategoryRepository } from './database/merchant-category/merchant-category.repository'
import { MerchantFilterOrmEntity } from './database/merchant-filter/merchant-filter.orm-entity'
import { MerchantFilterRepository } from './database/merchant-filter/merchant-filter.repository'
import { MerchantMerchantFilterOrmEntity } from './database/merchant-merchant-filter/merchant-merchant-filter.orm-entity'
import { MerchantMerchantFilterRepository } from './database/merchant-merchant-filter/merchant-merchant-filter.repository'
import { MerchantMerchantOrganizationOrmEntity } from './database/merchant-merchant-organization/merchant-merchant-organization.orm-entity'
import { MerchantMerchantOrganizationRepository } from './database/merchant-merchant-organization/merchant-merchant-organization.repository'
import { MerchantOrganizationOrmEntity } from './database/merchant-organization/merchant-organization.orm-entity'
import { MerchantOrganizationRepository } from './database/merchant-organization/merchant-organization.repository'
import { PaymentSolutionOrmEntity } from './database/payment-solution/payment-solution.orm-entity'
import { FindPointOfSaleQueryHandler } from './queries/find-point-of-sale/find-point-of-sale.query-handler'
import { FindPointOfSaleGraphqlResolver } from './queries/find-point-of-sale/find-point-of-sale.resolver'
import { PointOfSaleFiltersQueryHandler } from './queries/point-of-sale-filters/point-of-sale-filters.query-handler'
import { PointOfSaleFiltersGraphqlResolver } from './queries/point-of-sale-filters/point-of-sale-filters.resolver'

const repositories = [
  AdvantageRepository,
  AdvantageMerchantCategoryRepository,
  MerchantCategoryRepository,
  MerchantFilterRepository,
  MerchantMerchantFilterRepository,
  MerchantMerchantOrganizationRepository,
  MerchantOrganizationRepository,
  MerchantRepository,
]

const graphqlResolvers = [
  FindPointOfSaleGraphqlResolver,
  FindPointOfSalesGraphqlResolver,
  InsertMerchantWithSiretGraphqlResolver,
  PointOfSaleFiltersGraphqlResolver,
  UpsertMerchantGraphqlResolver,
]

const commandHandlers = [
  InsertMerchantWithSiretCommandHandler,
  UpdateMerchantMccCommandHandler,
  UpsertMerchantCommandHandler,
]

// const eventHandlers = [...merchantProviders]

const taskHandlers = [UpdateMerchantMccTaskHandler]

const queryHandlers = [
  FindPointOfSaleQueryHandler,
  FindPointOfSalesQueryHandler,
  PointOfSaleFiltersQueryHandler,
]

const controllers = [UpdateMerchantMccController]

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdvantageOrmEntity,
      AdvantageMerchantCategoryOrmEntity,
      CityOrmEntity,
      MerchantCategoryOrmEntity,
      MerchantFilterOrmEntity,
      MerchantMerchantFilterOrmEntity,
      MerchantMerchantOrganizationOrmEntity,
      MerchantOrganizationOrmEntity,
      MerchantOrmEntity,
      PaymentSolutionOrmEntity,
    ]),
    CsvModule,
    CqrsModule,
    MessageEmitterModule,
    forwardRef(() => OrganizationModule),
    forwardRef(() => WalletModule),
  ],
  controllers: [...controllers],
  providers: [
    ...repositories,
    ...graphqlResolvers,
    ...commandHandlers,
    // ...eventHandlers,
    ...taskHandlers,
    ...queryHandlers,
  ],
  exports: [...repositories],
})
export class MerchantModule {}
