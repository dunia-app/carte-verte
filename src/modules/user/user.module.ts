import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AuthModule } from '../auth/auth.module'
import { DeleteUserCommandHandler } from './commands/delete-user/delete-user.command-handler'
import { LoginSuperAdminCommandHandler } from './commands/login-super-admin/login-super-admin.command-handler'
import { LoginSuperAdminGraphqlResolver } from './commands/login-super-admin/login-super-admin.resolver'
import { SuperAdminOrmEntity } from './database/super-admin/super-admin.orm-entity'
import { SuperAdminRepository } from './database/super-admin/super-admin.repository'
import { UserOrmEntity } from './database/user/user.orm-entity'
import { UserRepository } from './database/user/user.repository'

const repositories = [UserRepository, SuperAdminRepository]

const graphqlResolvers = [LoginSuperAdminGraphqlResolver]

const commandHandlers = [
  DeleteUserCommandHandler,
  LoginSuperAdminCommandHandler,
]

// const queryHandlers = []

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, SuperAdminOrmEntity]),
    CqrsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [],
  providers: [
    ...repositories,
    ...graphqlResolvers,
    ...commandHandlers,
    // ...queryHandlers,
  ],
  exports: [...repositories],
})
export class UserModule {}
