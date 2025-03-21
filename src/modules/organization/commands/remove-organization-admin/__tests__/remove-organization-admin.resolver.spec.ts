import { INestApplication } from '@nestjs/common'
import { ConfigService } from '../../../../../infrastructure/config/config.service'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { DateVO } from '../../../../../libs/ddd/domain/value-objects/date.value-object'
import { ResolverResponseClass } from '../../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { loginAsOrganizationAdmin } from '../../../../../tests/auth_users'
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
import { OrganizationAdminIsTheLastOneError } from '../../../errors/organization-admin.errors'
import { OrganizationModule } from '../../../organization.module'
import { buildRemoveOrganizationAdminRequests } from './remove-organization-admin.requests'

describe('RemoveOrganizationAdmin (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
  })

  let requests: ReturnType<typeof buildRemoveOrganizationAdminRequests>
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
    requests = buildRemoveOrganizationAdminRequests(app)
    saltRound = new ConfigService().getSaltRound()
  })

  test('Should remove organization admin', async () => {
    const authInfo = await loginAsOrganizationAdmin(app)

    const authUserProps = authInfo.user.getPropsCopy()

    const userToDelete = (await UserFactory.saveOne(app, {
      role: UserRoles.organizationAdmin,
    })) as UserEntity

    const [_, organizationAdminToDelete] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: userToDelete.id,
      }),
      OrganizationAdminFactory.saveOne(app, {
        organizationId: authUserProps.organizationsIds[0],
        userId: userToDelete.id,
        activatedAt: new DateVO(new Date()),
      }),
    ])) as [ReceiverEntity, OrganizationAdminEntity]

    await requests
      .removeOrganizationAdmin(organizationAdminToDelete.id.value)
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              String,
              OrganizationAdminIsTheLastOneError
            >,
          ) => {
            expect(data.result).toBeTruthy()
            expect(data.error).toBeFalsy()
          },
        ),
      )
  })

  test('Should not remove the last organization admin', async () => {
    const authInfo = await loginAsOrganizationAdmin(app)

    const authUserProps = authInfo.user.getPropsCopy()

    await requests
      .removeOrganizationAdmin(authUserProps.id.value)
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              String,
              OrganizationAdminIsTheLastOneError
            >,
          ) => {
            expect(data.result).toBeFalsy()
            expect(data.error).toBeTruthy()
          },
        ),
      )
  })

  test('Should not remove organization admin with wrong id', async () => {
    const authInfo = await loginAsOrganizationAdmin(app)

    await requests
      .removeOrganizationAdmin('wrongId')
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              String,
              OrganizationAdminIsTheLastOneError
            >,
          ) => {
            console.log(data)
            expect(data).toBeUndefined()
          },
        ),
      )
  })

  afterAll(async () => {
    await app.close()
  })
})
