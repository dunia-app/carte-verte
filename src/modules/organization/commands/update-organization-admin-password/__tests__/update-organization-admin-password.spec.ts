import { INestApplication } from '@nestjs/common'
import bcrypt from 'bcrypt'
import { ConfigService } from '../../../../../infrastructure/config/config.service'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { ResolverResponseClass } from '../../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { onboardAsOrganizationAdmin } from '../../../../../tests/auth_users'
import { expectEqualResult } from '../../../../../tests/helpers/requests_helpers'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../../tests/test_utils'
import { OrganizationAdminRepository } from '../../../database/organization-admin/organization-admin.repository'
import { OrganizationAdminPassword } from '../../../domain/value-objects/organization-admin-password.value-object'
import { OrganizationModule } from '../../../organization.module'
import { UpdateOrganizationAdminPasswordRequest } from '../update-organization-admin-password.request.dto'
import { buildUpdateOrganizationAdminPasswordRequests } from './update-organization-admin-password.request'

describe('UpdateOrganizationAdminPassword (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    organizationAdminRepo: OrganizationAdminRepository,
  })

  let requests: ReturnType<typeof buildUpdateOrganizationAdminPasswordRequests>
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
    requests = buildUpdateOrganizationAdminPasswordRequests(app)
    saltRound = new ConfigService().getSaltRound()
  })

  it('Should update the organization admin password', async () => {
    const authInfo = await onboardAsOrganizationAdmin(app, {
      password: new OrganizationAdminPassword(
        bcrypt.hashSync('Azerty123!', saltRound),
      ),
    })

    const input: UpdateOrganizationAdminPasswordRequest = {
      currentPassword: 'Azerty123!',
      newPassword: 'Azerty1234!',
    }

    await requests
      .updateOrganizationAdminPassword(input)
      .set(authInfo.headers)
      .expect(
        expectEqualResult((data: ResolverResponseClass<string, any>) => {
          console.log(data)
          expect(data.result).toBeTruthy()
          expect(data.error).toBeFalsy()
        }),
      )
  })

  it('Should return an error if the current password is incorrect', async () => {
    const authInfo = await onboardAsOrganizationAdmin(app, {
      password: new OrganizationAdminPassword(
        bcrypt.hashSync('Azerty123!', saltRound),
      ),
    })

    const input: UpdateOrganizationAdminPasswordRequest = {
      currentPassword: 'WrongPassword',
      newPassword: 'Azerty1234!',
    }

    await requests
      .updateOrganizationAdminPassword(input)
      .set(authInfo.headers)
      .expect(
        expectEqualResult((data: ResolverResponseClass<string, any>) => {
          console.log(data)
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        }),
      )
  })

  it('Should return an error if the new password is invalid', async () => {
    const authInfo = await onboardAsOrganizationAdmin(app, {
      password: new OrganizationAdminPassword(
        bcrypt.hashSync('Azerty123!', saltRound),
      ),
    })

    const input: UpdateOrganizationAdminPasswordRequest = {
      currentPassword: 'Azerty123!',
      newPassword: 'weak',
    }

    await requests
      .updateOrganizationAdminPassword(input)
      .set(authInfo.headers)
      .expect(
        expectEqualResult((data: ResolverResponseClass<string, any>) => {
          console.log(data)
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        }),
      )
  })

  afterAll(async () => {
    await app.close()
  })
})
