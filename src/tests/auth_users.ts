import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { DateVO } from '../libs/ddd/domain/value-objects/date.value-object'
import { AuthService } from '../modules/auth/auth.service'
import { CardEntity } from '../modules/card/domain/entities/card.entity'
import {
  CardFactory,
  CardFactoryProps,
} from '../modules/card/domain/entities/card.factory'
import { AdvantageType } from '../modules/merchant/domain/entities/advantage.types'
import {
  ReceiverFactory,
  ReceiverFactoryProps,
} from '../modules/message/domain/entities/receiver.factory'
import { EmployeeEntity } from '../modules/organization/domain/entities/employee.entity'
import {
  EmployeeFactory,
  EmployeeFactoryProps,
} from '../modules/organization/domain/entities/employee.factory'
import { OrganizationAdminEntity } from '../modules/organization/domain/entities/organization-admin.entity'
import {
  OrganizationAdminFactory,
  OrganizationAdminFactoryProps,
} from '../modules/organization/domain/entities/organization-admin.factory'
import { OrganizationEntity } from '../modules/organization/domain/entities/organization.entity'
import {
  OrganizationFactory,
  OrganizationFactoryProps,
} from '../modules/organization/domain/entities/organization.factory'
import { EmployeeCode } from '../modules/organization/domain/value-objects/employee-code.value-object'
import { SuperAdminEntity } from '../modules/user/domain/entities/super-admin.entity'
import { SuperAdminFactory } from '../modules/user/domain/entities/super-admin.factory'
import { UserEntity } from '../modules/user/domain/entities/user.entity'
import { UserFactory } from '../modules/user/domain/entities/user.factory'
import { UserRoles } from '../modules/user/domain/entities/user.types'
import { WalletEntity } from '../modules/wallet/domain/entities/wallet.entity'
import {
  WalletFactory,
  WalletFactoryProps,
} from '../modules/wallet/domain/entities/wallet.factory'

export type AuthInfo = {
  headers: {
    Authorization: string
  }
  user: EmployeeEntity | OrganizationAdminEntity | SuperAdminEntity
}

export async function loginAsEmployee(
  app: INestApplication,
  employeeDefaults = {} as Partial<EmployeeFactoryProps>,
  walletDefaults = {} as Partial<WalletFactoryProps>,
  organizationDefaults = {} as Partial<OrganizationFactoryProps>,
  receiverDefaults = {} as Partial<ReceiverFactoryProps>,
  noneWalletDefaults = {} as Partial<WalletFactoryProps>,
) {
  const { userId, organizationId } = await createMandatoryEntities(
    app,
    UserRoles.employee,
    organizationDefaults,
    receiverDefaults,
  )
  const employee = (await EmployeeFactory.saveOne(app, {
    organizationId: organizationId,
    userId: userId,
    ...employeeDefaults,
  })) as EmployeeEntity

  const [wallet, noneWallet] = (await Promise.all([
    WalletFactory.saveOne(app, {
      employeeId: employee.id,
      ...walletDefaults,
    }),
    WalletFactory.saveOne(app, {
      employeeId: employee.id,
      advantage: AdvantageType.NONE,
      ...noneWalletDefaults
    }),
  ])) as [WalletEntity, WalletEntity]
  const authService = app.get(AuthService)
  const jwt = authService.createJWT(employee.id, UserRoles.employee)
  return {
    authInfo: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      user: employee,
    },
    wallet: wallet,
    noneWallet: noneWallet
  }
}

export async function onboardAsEmployee(
  app: INestApplication,
  employeeDefaults = {} as Partial<EmployeeFactoryProps>,
  walletDefaults = {} as Partial<WalletFactoryProps>,
  cardDefaults = {} as Partial<CardFactoryProps>,
  organizationDefaults = {} as Partial<OrganizationFactoryProps>,
  receiverDefaults = {} as Partial<ReceiverFactoryProps>,
  noneWalletDefaults = {} as Partial<WalletFactoryProps>,
) {
  const { authInfo, wallet, noneWallet } = await loginAsEmployee(
    app,
    {
      activatedAt: new DateVO(new Date()),
      cguAcceptedAt: new DateVO(new Date()),
      code: new EmployeeCode(
        faker.string.numeric({ length: 4, allowLeadingZeros: true }),
      ),
      ...employeeDefaults,
    },
    walletDefaults,
    organizationDefaults,
    receiverDefaults,
    noneWalletDefaults,
  )

  const card = (await CardFactory.saveOne(app, {
    employeeId: authInfo.user.id,
    ...cardDefaults,
  })) as CardEntity
  return { authInfo, wallet, card, noneWallet }
}

export async function loginAsOrganizationAdmin(
  app: INestApplication,
  userDefaults = {} as Partial<OrganizationAdminFactoryProps>,
  organizationDefaults = {} as Partial<OrganizationFactoryProps>,
) {
  const { userId, organizationId } = await createMandatoryEntities(
    app,
    UserRoles.organizationAdmin,
    organizationDefaults,
  )
  const organizationAdmin = (await OrganizationAdminFactory.saveOne(app, {
    organizationId: organizationId,
    userId: userId,
    ...userDefaults,
  })) as OrganizationAdminEntity

  const authService = app.get(AuthService)
  const jwt = authService.createJWT(
    organizationAdmin.id,
    UserRoles.organizationAdmin,
  )
  return {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    user: organizationAdmin,
  }
}

export async function onboardAsOrganizationAdmin(
  app: INestApplication,
  userDefaults = {} as Partial<OrganizationAdminFactoryProps>,
  organizationDefaults = {} as Partial<OrganizationFactoryProps>,
) {
  return await loginAsOrganizationAdmin(
    app,
    {
      activatedAt: new DateVO(new Date()),
      ...userDefaults,
    },
    {
      hasAcceptedOffer: true,
      ...organizationDefaults,
    },
  )
}

export async function loginAsSuperAdmin(
  app: INestApplication,
  userDefaults = {} as Partial<SuperAdminEntity>,
  organizationDefaults = {} as Partial<OrganizationFactoryProps>,
) {
  const { userId } = await createMandatoryEntities(
    app,
    UserRoles.superAdmin,
    organizationDefaults,
  )
  const superAdmin = (await SuperAdminFactory.saveOne(app, {
    userId: userId,
    ...userDefaults,
  })) as SuperAdminEntity

  const authService = app.get(AuthService)
  const jwt = authService.createJWT(superAdmin.id, UserRoles.superAdmin)
  return {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    user: superAdmin,
  }
}

async function createMandatoryEntities(
  app: INestApplication,
  role: UserRoles,
  organizationDefaults = {} as Partial<OrganizationFactoryProps>,
  receiverDefaults = {} as Partial<ReceiverFactoryProps>,
) {
  const [user, organization] = (await Promise.all([
    UserFactory.saveOne(app, {
      role: role,
    }),
    OrganizationFactory.saveOne(app, organizationDefaults),
  ])) as [UserEntity, OrganizationEntity]
  await ReceiverFactory.saveOne(app, {
    ...receiverDefaults,
    userId: user.id,
  })
  if (!user?.id)
    throw new Error('Could not login user (database insert failed)')

  return {
    userId: user.id,
    organizationId: organization.id,
  }
}