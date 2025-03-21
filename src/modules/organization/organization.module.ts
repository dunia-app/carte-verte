import { forwardRef, Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BaasModule } from '../../infrastructure/baas/baas.module'
import { PlaceAutocompleteModule } from '../../infrastructure/place-autocomplete/place-autocomplete.module'
import { AuthModule } from '../auth/auth.module'
import { MessageModule } from '../message/message.module'
import { WalletModule } from '../wallet/wallet.module'
import { DeleteRemovedEmployeesTaskHandler } from './application/task-handlers/delete-removed-employees.task-handler'
import { AcceptCguCommandHandler } from './commands/accept-cgu/accept-cgu.command-handler'
import { AcceptCguGraphqlResolver } from './commands/accept-cgu/accept-cgu.resolver'
import { AcceptOrganizationOfferCommandHandler } from './commands/accept-organization-offer/accept-organization-offer.command-handler'
import { AcceptOrganizationOfferGraphqlResolver } from './commands/accept-organization-offer/accept-organization-offer.resolver'
import { AddOrganizationAdminAdminGraphqlResolver } from './commands/add-organization-admin/add-organization-admin-admin.resolver'
import { AddOrganizationAdminCommandHandler } from './commands/add-organization-admin/add-organization-admin.command-handler'
import { AddOrganizationAdminGraphqlResolver } from './commands/add-organization-admin/add-organization-admin.resolver'
import { AskEmployeeDeviceValidationTokenCommandHandler } from './commands/ask-employee-device-validation-token/ask-employee-device-validation-token.command-handler'
import { AskEmployeeDeviceValidationTokenGraphqlResolver } from './commands/ask-employee-device-validation-token/ask-employee-device-validation-token.resolver'
import { AskNewEmployeeLoginTokenCommandHandler } from './commands/ask-new-employee-login-token/ask-new-employee-login-token.command-handler'
import { AskNewEmployeeLoginTokenGraphqlResolver } from './commands/ask-new-employee-login-token/ask-new-employee-login-token.resolver'
import { AskNewEmployeeSmsTokenCommandHandler } from './commands/ask-new-employee-sms-token/ask-new-employee-sms-token.command-handler'
import { AskNewEmployeeSmsTokenGraphqlResolver } from './commands/ask-new-employee-sms-token/ask-new-employee-sms-token.resolver'
import { AskNewOrganizationAdminLoginTokenCommandHandler } from './commands/ask-new-organization-admin-login-token/ask-new-organization-admin-login-token.command-handler'
import { AskNewOrganizationAdminLoginTokenGraphqlResolver } from './commands/ask-new-organization-admin-login-token/ask-new-organization-admin-login-token.resolver'
import { AskResetEmployeeCodeCommandHandler } from './commands/ask-reset-employee-code/ask-reset-employee-code.command-handler'
import { AskResetEmployeeCodeGraphqlResolver } from './commands/ask-reset-employee-code/ask-reset-employee-code.resolver'
import { AskResetOrganizationAdminPasswordCommandHandler } from './commands/ask-reset-organization-admin-password/ask-reset-organization-admin-password.command-handler'
import { AskResetOrganizationAdminPasswordGraphqlResolver } from './commands/ask-reset-organization-admin-password/ask-reset-organization-admin-password.resolver'
import { CreateEmployeeCommandHandler } from './commands/create-employee/create-employee.command-handler'
import { CreateEmployeeGraphqlResolver } from './commands/create-employee/create-employee.resolver'
import { CreateNewOrganizationAdminCommandHandler } from './commands/create-new-organization-admin/create-new-organization-admin.command-handler'
import { CreateNewOrganizationAdminGraphqlResolver } from './commands/create-new-organization-admin/create-new-organization-admin.resolver'
import { CreateOrganizationAdminDevCommandHandler } from './commands/create-organization-admin-dev/create-organization-admin-dev.command-handler'
import { CreateOrganizationAdminDevGraphqlResolver } from './commands/create-organization-admin-dev/create-organization-admin-dev.resolver'
import { CreateOrganizationCommandHandler } from './commands/create-organization/create-organization.command-handler'
import { DeleteEmployeesCommandHandler } from './commands/delete-employees/delete-employees.command-handler'
import { DeleteEmployeesController } from './commands/delete-employees/delete-employees.task.controller'
import { FreezeEmployeeCommandHandler } from './commands/freeze-employee/freeze-employee.command-handler'
import { FreezeEmployeeGraphqlResolver } from './commands/freeze-employee/freeze-employee.resolver'
import { LoginEmployeeNewDeviceIdCommandHandler } from './commands/login-employee-new-device-id/login-employee-new-device-id.command-handler'
import { LoginEmployeeNewDeviceIdGraphqlResolver } from './commands/login-employee-new-device-id/login-employee-new-device-id.resolver'
import { LoginEmployeeCommandHandler } from './commands/login-employee/login-employee.command-handler'
import { LoginEmployeeGraphqlResolver } from './commands/login-employee/login-employee.resolver'
import { LoginOrganizationAdminCommandHandler } from './commands/login-organization-admin/login-organization-admin.command-handler'
import { LoginOrganizationAdminGraphqlResolver } from './commands/login-organization-admin/login-organization-admin.resolver'
import { LogoutEmployeeCommandHandler } from './commands/logout-employee/logout-employee.command-handler'
import { LogoutEmployeeGraphqlResolver } from './commands/logout-employee/logout-employee.resolver'
import { PushEmployeeDeviceIdCommandHandler } from './commands/push-employee-device-id/push-employee-device-id.command-handler'
import { RefreshEmployeeTokenCommandHandler } from './commands/refresh-employee-token/refresh-employee-token.command-handler'
import { RefreshEmployeeTokenGraphqlResolver } from './commands/refresh-employee-token/refresh-employee-token.resolver'
import { RefreshOrganizationAdminTokenCommandHandler } from './commands/refresh-organization-admin-token/refresh-organization-admin-token.command-handler'
import { RefreshOrganizationAdminTokenGraphqlResolver } from './commands/refresh-organization-admin-token/refresh-organization-admin-token.resolver'
import { RegisterOrganizationAdminCommandHandler } from './commands/register-organization-admin/register-organization-admin.command-handler'
import { RegisterOrganizationAdminGraphqlResolver } from './commands/register-organization-admin/register-organization-admin.resolver'
import { RemoveEmployeeCommandHandler } from './commands/remove-employee/remove-employee.command-handler'
import { RemoveEmployeeGraphqlResolver } from './commands/remove-employee/remove-employee.resolver'
import { RemoveOrganizationAdminCommandHandler } from './commands/remove-organization-admin/remove-organization-admin.command-handler'
import { RemoveOrganizationAdminGraphqlResolver } from './commands/remove-organization-admin/remove-organization-admin.resolver'
import { SetEmployeeAccountAdminGraphqlResolver } from './commands/set-employee-account/set-employee-account-admin.resolver'
import { SetEmployeeAccountCommandHandler } from './commands/set-employee-account/set-employee-account.command-handler'
import { SetEmployeeAccountGraphqlResolver } from './commands/set-employee-account/set-employee-account.resolver'
import { SetEmployeeCodeCommandHandler } from './commands/set-employee-code/set-employee-code.command-handler'
import { SetEmployeeCodeGraphqlResolver } from './commands/set-employee-code/set-employee-code.resolver'
import { SetMealTicketConfigCommandHandler } from './commands/set-meal-ticket-config/set-meal-ticket-config.command-handler'
import { SetMealTicketConfigGraphqlResolver } from './commands/set-meal-ticket-config/set-meal-ticket-config.resolver'
import { SetOrganizationAdminPasswordCommandHandler } from './commands/set-organization-admin-password/set-organization-admin-password.command-handler'
import { SetOrganizationAdminPasswordGraphqlResolver } from './commands/set-organization-admin-password/set-organization-admin-password.resolver'
import { UnfreezeEmployeeCommandHandler } from './commands/unfreeze-employee/unfreeze-employee.command-handler'
import { UnfreezeEmployeeGraphqlResolver } from './commands/unfreeze-employee/unfreeze-employee.resolver'
import { UpdateEmployeeCodeCommandHandler } from './commands/update-employee-code/update-employee-code.command-handler'
import { UpdateEmployeeCodeGraphqlResolver } from './commands/update-employee-code/update-employee-code.resolver'
import { UpdateEmployeeCommandHandler } from './commands/update-employee/update-employee.command-handler'
import { UpdateEmployeeGraphqlResolver } from './commands/update-employee/update-employee.resolver'
import { UpdateOrgnanizationAdminPasswordCommandHandler } from './commands/update-organization-admin-password/update-organization-admin-password.command-handler'
import { UpdateOrgnanizationAdminPasswordGraphqlResolver } from './commands/update-organization-admin-password/update-organization-admin-password.resolver'
import { UpdateOrganizationAdminCommandHandler } from './commands/update-organization-admin/update-organization-admin.command-handler'
import { UpdateOrganizationAdminGraphqlResolver } from './commands/update-organization-admin/update-organization-admin.resolver'
import { EmployeeOrmEntity } from './database/employee/employee.orm-entity'
import { EmployeeRepository } from './database/employee/employee.repository'
import { OrganizationAdminOrmEntity } from './database/organization-admin/organization-admin.orm-entity'
import { OrganizationAdminRepository } from './database/organization-admin/organization-admin.repository'
import { OrganizationOrmEntity } from './database/organization/organization.orm-entity'
import { OrganizationRepository } from './database/organization/organization.repository'
import { OrganizationAdminsOrganizationsOrmEntity } from './database/organization_admins_organizations/organization_admins_organizations.orm-entity'
import { EmployeeDeviceValidationInfoQueryHandler } from './queries/employee-device-validation-info/employee-device-validation-info.query-handler'
import { EmployeeDeviceValidationInfoGraphqlResolver } from './queries/employee-device-validation-info/employee-device-validation-info.resolver'
import { EmployeeInfoQueryHandler } from './queries/employee-info/employee-info.query-handler'
import { EmployeeInfoGraphqlResolver } from './queries/employee-info/employee-info.resolver'
import { EmployeeStatusQueryHandler } from './queries/employee-status/employee-status.query-handler'
import { EmployeeStatusGraphqlResolver } from './queries/employee-status/employee-status.resolver'
import { FindAccessibleOrganizationsQueryHandler } from './queries/find-accessible-organizations/find-accessible-organizations.query-handler'
import { FindAccessibleOrganizationsGraphqlResolver } from './queries/find-accessible-organizations/find-accessible-organizations.resolver'
import { FindEmployeeQueryHandler } from './queries/find-employee/find-employee.query-handler'
import { FindEmployeeGraphqlResolver } from './queries/find-employee/find-employee.resolver'
import { FindEmployeesQueryHandler } from './queries/find-employees/find-employees.query-handler'
import { FindEmployeesGraphqlResolver } from './queries/find-employees/find-employees.resolver'
import { FindOrganizationAdminQueryHandler } from './queries/find-organization-admin/find-organization-admin.query-handler'
import { FindOrganizationAdminGraphqlResolver } from './queries/find-organization-admin/find-organization-admin.resolver'
import { FindOrganizationAdminsQueryHandler } from './queries/find-organization-admins/find-organization-admins.query-handler'
import { FindOrganizationAdminsGraphqlResolver } from './queries/find-organization-admins/find-organization-admins.resolver'
import { MealTicketConfigQueryHandler } from './queries/meal-ticket-config/meal-ticket-config.query-handler'
import { MealTicketConfigGraphqlResolver } from './queries/meal-ticket-config/meal-ticket-config.resolver'
import { OrganizationAdminStatusQueryHandler } from './queries/organization-admin-status/organization-admin-status.query-handler'
import { OrganizationAdminStatusGraphqlResolver } from './queries/organization-admin-status/organization-admin-status.resolver'
import { OrganizationInfoQueryHandler } from './queries/organization-info/organization-info.query-handler'
import { OrganizationInfoGraphqlResolver } from './queries/organization-info/organization-info.resolver'
import { OrganizationStatusByTokenQueryHandler } from './queries/organization-status-by-token/organization-status-by-token.query-handler'
import { OrganizationStatusByTokenGraphqlResolver } from './queries/organization-status-by-token/organization-status-by-token.resolver'
import { OrganizationStatusQueryHandler } from './queries/organization-status/organization-status.query-handler'
import { OrganizationStatusGraphqlResolver } from './queries/organization-status/organization-status.resolver'
import { ValidateEmployeeMailTokenGraphqlResolver } from './queries/validate-employee-mail-token/validate-employee-mail-token.resolver'
import { ValidateEmployeeSmsTokenGraphqlResolver } from './queries/validate-employee-sms-token/validate-employee-sms-token.resolver'
import { ValidateOrganizationAdminMailTokenGraphqlResolver } from './queries/validate-organization-admin-mail-token/validate-organization-admin-mail-token.resolver'
import { ValidateOrganizationAdminPasswordQueryHandler } from './queries/validate-organization-admin-password/validate-organization-admin-password.query-handler'
import { ValidateOrganizationAdminPasswordGraphqlResolver } from './queries/validate-organization-admin-password/validate-organization-admin-password.resolver'

const graphqlResolvers = [
  AcceptCguGraphqlResolver,
  AcceptOrganizationOfferGraphqlResolver,
  AddOrganizationAdminAdminGraphqlResolver,
  AddOrganizationAdminGraphqlResolver,
  AskEmployeeDeviceValidationTokenGraphqlResolver,
  AskNewEmployeeLoginTokenGraphqlResolver,
  AskNewEmployeeSmsTokenGraphqlResolver,
  AskNewOrganizationAdminLoginTokenGraphqlResolver,
  AskResetEmployeeCodeGraphqlResolver,
  AskResetOrganizationAdminPasswordGraphqlResolver,
  CreateEmployeeGraphqlResolver,
  CreateOrganizationAdminDevGraphqlResolver,
  EmployeeDeviceValidationInfoGraphqlResolver,
  EmployeeInfoGraphqlResolver,
  EmployeeStatusGraphqlResolver,
  FindEmployeeGraphqlResolver,
  FindEmployeesGraphqlResolver,
  FindOrganizationAdminsGraphqlResolver,
  FindOrganizationAdminGraphqlResolver,
  FindAccessibleOrganizationsGraphqlResolver,
  FreezeEmployeeGraphqlResolver,
  LoginEmployeeGraphqlResolver,
  LoginEmployeeNewDeviceIdGraphqlResolver,
  LogoutEmployeeGraphqlResolver,
  LoginOrganizationAdminGraphqlResolver,
  MealTicketConfigGraphqlResolver,
  OrganizationAdminStatusGraphqlResolver,
  OrganizationInfoGraphqlResolver,
  OrganizationStatusGraphqlResolver,
  OrganizationStatusByTokenGraphqlResolver,
  RefreshEmployeeTokenGraphqlResolver,
  RefreshOrganizationAdminTokenGraphqlResolver,
  RegisterOrganizationAdminGraphqlResolver,
  RemoveEmployeeGraphqlResolver,
  RemoveOrganizationAdminGraphqlResolver,
  SetEmployeeAccountAdminGraphqlResolver,
  SetEmployeeAccountGraphqlResolver,
  SetEmployeeCodeGraphqlResolver,
  SetMealTicketConfigGraphqlResolver,
  SetOrganizationAdminPasswordGraphqlResolver,
  UnfreezeEmployeeGraphqlResolver,
  UpdateEmployeeCodeGraphqlResolver,
  UpdateEmployeeGraphqlResolver,
  UpdateOrganizationAdminGraphqlResolver,
  ValidateEmployeeMailTokenGraphqlResolver,
  ValidateEmployeeSmsTokenGraphqlResolver,
  ValidateOrganizationAdminMailTokenGraphqlResolver,
  ValidateOrganizationAdminPasswordGraphqlResolver,
  UpdateOrgnanizationAdminPasswordGraphqlResolver,
  CreateNewOrganizationAdminGraphqlResolver,
]

const repositories = [
  EmployeeRepository,
  OrganizationRepository,
  OrganizationAdminRepository,
]

const commandHandlers = [
  AcceptCguCommandHandler,
  AcceptOrganizationOfferCommandHandler,
  AddOrganizationAdminCommandHandler,
  AddOrganizationAdminCommandHandler,
  AskEmployeeDeviceValidationTokenCommandHandler,
  AskNewEmployeeLoginTokenCommandHandler,
  AskNewEmployeeSmsTokenCommandHandler,
  AskNewOrganizationAdminLoginTokenCommandHandler,
  AskResetEmployeeCodeCommandHandler,
  AskResetOrganizationAdminPasswordCommandHandler,
  CreateEmployeeCommandHandler,
  CreateOrganizationAdminDevCommandHandler,
  CreateOrganizationCommandHandler,
  DeleteEmployeesCommandHandler,
  FreezeEmployeeCommandHandler,
  LoginEmployeeCommandHandler,
  LoginEmployeeNewDeviceIdCommandHandler,
  LogoutEmployeeCommandHandler,
  LoginOrganizationAdminCommandHandler,
  PushEmployeeDeviceIdCommandHandler,
  RefreshEmployeeTokenCommandHandler,
  RefreshOrganizationAdminTokenCommandHandler,
  RegisterOrganizationAdminCommandHandler,
  RemoveEmployeeCommandHandler,
  RemoveOrganizationAdminCommandHandler,
  SetEmployeeAccountCommandHandler,
  SetEmployeeCodeCommandHandler,
  SetMealTicketConfigCommandHandler,
  SetOrganizationAdminPasswordCommandHandler,
  UnfreezeEmployeeCommandHandler,
  UpdateEmployeeCodeCommandHandler,
  UpdateEmployeeCommandHandler,
  UpdateOrgnanizationAdminPasswordCommandHandler,
  UpdateOrganizationAdminCommandHandler,
  CreateNewOrganizationAdminCommandHandler,
]

const queryHandlers = [
  EmployeeDeviceValidationInfoQueryHandler,
  EmployeeInfoQueryHandler,
  EmployeeStatusQueryHandler,
  FindEmployeeQueryHandler,
  FindEmployeesQueryHandler,
  FindOrganizationAdminsQueryHandler,
  FindOrganizationAdminQueryHandler,
  FindAccessibleOrganizationsQueryHandler,
  MealTicketConfigQueryHandler,
  OrganizationAdminStatusQueryHandler,
  OrganizationInfoQueryHandler,
  OrganizationStatusQueryHandler,
  OrganizationStatusByTokenQueryHandler,
  ValidateOrganizationAdminPasswordQueryHandler,
]

const taskHandlers = [DeleteRemovedEmployeesTaskHandler]

const controllers = [DeleteEmployeesController]

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeOrmEntity,
      OrganizationOrmEntity,
      OrganizationAdminOrmEntity,
      OrganizationAdminsOrganizationsOrmEntity,
    ]),
    forwardRef(() => AuthModule),
    BaasModule,
    CqrsModule,
    forwardRef(() => MessageModule),
    forwardRef(() => WalletModule),
    PlaceAutocompleteModule,
  ],
  controllers: [...controllers],
  providers: [
    ...repositories,
    ...graphqlResolvers,
    ...commandHandlers,
    ...queryHandlers,
    ...taskHandlers,
  ],
  exports: [...repositories],
})
export class OrganizationModule {}
