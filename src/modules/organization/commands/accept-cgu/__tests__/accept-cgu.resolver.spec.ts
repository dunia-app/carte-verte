import { INestApplication } from '@nestjs/common'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { DateVO } from '../../../../../libs/ddd/domain/value-objects/date.value-object'
import { ResolverResponseClass } from '../../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { LoginResponse } from '../../../../../libs/ddd/interface-adapters/dtos/login.response.dto'
import { loginAsEmployee } from '../../../../../tests/auth_users'
import { expectEqualResult } from '../../../../../tests/helpers/requests_helpers'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../../tests/test_utils'
import { WalletModule } from '../../../../wallet/wallet.module'
import {
  EmployeeAlreadyAcceptedCguError,
  EmployeeFrozenError,
} from '../../../errors/employee.errors'
import { OrganizationModule } from '../../../organization.module'
import { buildAcceptCguRequests } from './accept-cgu.requests'

describe('AcceptCgu (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
  })

  let requests: ReturnType<typeof buildAcceptCguRequests>

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [OrganizationModule, WalletModule],
      },
      services,
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()
    requests = buildAcceptCguRequests(app)
  })

  it('Should accept cgu as employee', async () => {
    const { authInfo, wallet } = await loginAsEmployee(app)

    await requests
      .acceptCgu()
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              LoginResponse,
              EmployeeAlreadyAcceptedCguError | EmployeeFrozenError
            >,
          ) => {
            expect(data.result).toBeTruthy()
            expect(data.error).toBeFalsy()
          },
        ),
      )
  })

  it('Should not accept cgu as employee already accepted them', async () => {
    const { authInfo, wallet } = await loginAsEmployee(app, {
      cguAcceptedAt: new DateVO(new Date()),
    })

    await requests
      .acceptCgu()
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              LoginResponse,
              EmployeeAlreadyAcceptedCguError | EmployeeFrozenError
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
