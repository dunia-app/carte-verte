import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import bcrypt from 'bcrypt'
import { ConfigService } from '../../../../../infrastructure/config/config.service'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { DateVO } from '../../../../../libs/ddd/domain/value-objects/date.value-object'
import { ResolverResponseClass } from '../../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { LoginResponse } from '../../../../../libs/ddd/interface-adapters/dtos/login.response.dto'
import { expectEqualResult } from '../../../../../tests/helpers/requests_helpers'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../../tests/test_utils'
import { ReceiverEntity } from '../../../../message/domain/entities/receiver.entity'
import { ReceiverFactory } from '../../../../message/domain/entities/receiver.factory'
import { UserEntity } from '../../../../user/domain/entities/user.entity'
import { UserFactory } from '../../../../user/domain/entities/user.factory'
import { UserRoles } from '../../../../user/domain/entities/user.types'
import { OrganizationAdminEntity } from '../../../domain/entities/organization-admin.entity'
import { OrganizationAdminFactory } from '../../../domain/entities/organization-admin.factory'
import { OrganizationEntity } from '../../../domain/entities/organization.entity'
import { OrganizationFactory } from '../../../domain/entities/organization.factory'
import { OrganizationAdminPassword } from '../../../domain/value-objects/organization-admin-password.value-object'
import {
  OrganizationAdminNotActivatedError,
  OrganizationAdminNotFoundError,
  WrongOrganizationAdminPasswordError,
} from '../../../errors/organization-admin.errors'
import { OrganizationModule } from '../../../organization.module'
import { LoginOrganizationAdminRequest } from '../login-organization-admin.request.dto'
import { buildLoginOrganizationAdminRequests } from './login-organization-admin.requests'

describe('LoginOrganizationAdmin (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
  })

  let requests: ReturnType<typeof buildLoginOrganizationAdminRequests>
  let saltRound: number

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [OrganizationModule],
      },
      services,
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()
    requests = buildLoginOrganizationAdminRequests(app)
    saltRound = new ConfigService().getSaltRound()
  })

  it('Should get a login token as organizationAdmin', async () => {
    const [user, organization] = (await Promise.all([
      UserFactory.saveOne(app, {
        role: UserRoles.organizationAdmin,
      }),
      OrganizationFactory.saveOne(app),
    ])) as [UserEntity, OrganizationEntity]
    const [receiver, _organizationAdmin] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: user.id,
      }),
      OrganizationAdminFactory.saveOne(app, {
        organizationId: organization.id,
        userId: user.id,
        activatedAt: new DateVO(new Date()),
        password: new OrganizationAdminPassword(
          bcrypt.hashSync('Azerty123!', saltRound),
        ),
      }),
    ])) as [ReceiverEntity, OrganizationAdminEntity]

    const input: LoginOrganizationAdminRequest = {
      email: receiver.email.value,
      password: 'Azerty123!',
    }
    await requests.loginOrganizationAdmin(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            | OrganizationAdminNotActivatedError
            | WrongOrganizationAdminPasswordError
            | OrganizationAdminNotFoundError
          >,
        ) => {
          expect(data.result).toBeTruthy()
          expect(data.error).toBeFalsy()
        },
      ),
    )
  })

  it('Should not get a login token as unactivated organizationAdmin', async () => {
    const [user, organization] = (await Promise.all([
      UserFactory.saveOne(app, {
        role: UserRoles.organizationAdmin,
      }),
      OrganizationFactory.saveOne(app),
    ])) as [UserEntity, OrganizationEntity]
    const [receiver, _organizationAdmin] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: user.id,
      }),
      OrganizationAdminFactory.saveOne(app, {
        organizationId: organization.id,
        userId: user.id,
      }),
    ])) as [ReceiverEntity, OrganizationAdminEntity]

    const input: LoginOrganizationAdminRequest = {
      email: receiver.email.value,
      password: 'Azerty123!',
    }
    await requests.loginOrganizationAdmin(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            | OrganizationAdminNotActivatedError
            | WrongOrganizationAdminPasswordError
            | OrganizationAdminNotFoundError
          >,
        ) => {
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        },
      ),
    )
  })

  it('Should not get a login token as wrong password organizationAdmin', async () => {
    const [user, organization] = (await Promise.all([
      UserFactory.saveOne(app, {
        role: UserRoles.organizationAdmin,
      }),
      OrganizationFactory.saveOne(app),
    ])) as [UserEntity, OrganizationEntity]
    const [receiver, _organizationAdmin] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: user.id,
      }),
      OrganizationAdminFactory.saveOne(app, {
        organizationId: organization.id,
        userId: user.id,
        activatedAt: new DateVO(new Date()),
        password: new OrganizationAdminPassword(
          bcrypt.hashSync('Azerty123!', saltRound),
        ),
      }),
    ])) as [ReceiverEntity, OrganizationAdminEntity]

    const input: LoginOrganizationAdminRequest = {
      email: receiver.email.value,
      password: 'AzertyAzerty123!!',
    }
    await requests.loginOrganizationAdmin(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            | OrganizationAdminNotActivatedError
            | WrongOrganizationAdminPasswordError
            | OrganizationAdminNotFoundError
          >,
        ) => {
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        },
      ),
    )
  })

  it('Should not get a login token as unexisting organizationAdmin', async () => {
    const input: LoginOrganizationAdminRequest = {
      email: faker.internet.email(),
      password: 'Azerty123!',
    }
    await requests.loginOrganizationAdmin(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            | OrganizationAdminNotActivatedError
            | WrongOrganizationAdminPasswordError
            | OrganizationAdminNotFoundError
          >,
        ) => {
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        },
      ),
    )
  })

  afterAll(async () => {
    await app.close()
  })
})
