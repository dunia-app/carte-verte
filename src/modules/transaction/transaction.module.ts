import { Module, forwardRef } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { CsvModule } from 'nest-csv-parser'
import { CardModule } from '../card/card.module'
import { MessageModule } from '../message/message.module'
import { OrganizationModule } from '../organization/organization.module'
import { DistributeRetroactiveCashbackTaskHandler } from './application/task-handlers/distribute-retroactive-cashback.task-handler'
import { CreateTransactionDevCommandHandler } from './commands/create-transaction-dev/create-transaction-dev.command-handler'
import { CreateTransactionDevGraphqlResolver } from './commands/create-transaction-dev/create-transaction-dev.resolver'
import { CreateTransactionCommandHandler } from './commands/create-transaction/create-transaction.command-handler'
import { DistributeCashbackAdminCommandHandler } from './commands/distribute-cashback/distribute-cashback-admin.command-handler'
import { DistributeCashbackAdminGraphqlResolver } from './commands/distribute-cashback/distribute-cashback-admin.resolver'
import { DistributeRetroactiveCashbackCommandHandler } from './commands/distribute-retroactive-cashback/distribute-retroactive-cashback.command-handler'
import { DistributeRetroactiveCashbackController } from './commands/distribute-retroactive-cashback/distribute-retroactive-cashback.task.controller'
import { FetchExternalTransactionGraphqlResolver } from './commands/fetch-external-transaction/fetch-external-transaction.resolver'
import { TransactionOrmEntity } from './database/transaction/transaction.orm-entity'
import { TransactionRepository } from './database/transaction/transaction.repository'
import { TransferOrmEntity } from './database/transfer/transfer.orm-entity'
import { TransferRepository } from './database/transfer/transfer.repository'
import { FindTransactionsQueryHandler } from './queries/find-transactions/find-transactions.query-handler'
import { FindTransactionsGraphqlResolver } from './queries/find-transactions/find-transactions.resolver'

const repositories = [TransactionRepository, TransferRepository]

const graphqlResolvers = [
  CreateTransactionDevGraphqlResolver,
  DistributeCashbackAdminGraphqlResolver,
  FetchExternalTransactionGraphqlResolver,
  FindTransactionsGraphqlResolver,
]

const commandHandlers = [
  CreateTransactionCommandHandler,
  CreateTransactionDevCommandHandler,
  DistributeCashbackAdminCommandHandler,
  DistributeRetroactiveCashbackCommandHandler,
]

// const eventHandlers = []

const taskHandlers = [DistributeRetroactiveCashbackTaskHandler]

const queryHandlers = [FindTransactionsQueryHandler]

const controllers = [DistributeRetroactiveCashbackController]

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionOrmEntity, TransferOrmEntity]),
    forwardRef(() => CardModule),
    forwardRef(() => MessageModule),
    forwardRef(() => OrganizationModule),
    CsvModule,
    CqrsModule,
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
export class TransactionModule {}
