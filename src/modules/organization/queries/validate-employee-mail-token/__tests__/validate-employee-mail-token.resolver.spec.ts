import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import cryptoRandomString from 'crypto-random-string'
import { CacheTimes, getCacheTime } from '../../../../../helpers/cache.helper'
import { TokenExpiredError } from '../../../../../infrastructure/redis/redis.errors'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { ResolverResponseClass } from '../../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
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
import { EmployeeRepository } from '../../../database/employee/employee.repository'
import { EmployeeEntity } from '../../../domain/entities/employee.entity'
import { EmployeeFactory } from '../../../domain/entities/employee.factory'
import { OrganizationEntity } from '../../../domain/entities/organization.entity'
import { OrganizationFactory } from '../../../domain/entities/organization.factory'
import { OrganizationModule } from '../../../organization.module'
import { ValidateEmployeeMailTokenRequest } from '../validate-employee-mail-token.request.dto'
import { buildValidateEmployeeMailTokenRequests } from './validate-employee-mail-token.requests'

describe('ValidateEmployeeMailToken (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    employeeRepo: EmployeeRepository,
  })

  let requests: ReturnType<typeof buildValidateEmployeeMailTokenRequests>

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
    requests = buildValidateEmployeeMailTokenRequests(app)
  })

  it('Should validate email', async () => {
    const [user, organization] = (await Promise.all([
      UserFactory.saveOne(app, {
        role: UserRoles.employee,
      }),
      OrganizationFactory.saveOne(app),
    ])) as [UserEntity, OrganizationEntity]
    const [receiver, employee] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: user.id,
      }),
      EmployeeFactory.saveOne(app, {
        organizationId: organization.id,
        userId: user.id,
      }),
    ])) as [ReceiverEntity, EmployeeEntity]

    const loginToken = cryptoRandomString({ length: 10, type: 'numeric' })

    await services.redis.persist.set(
      loginToken,
      JSON.stringify({ email: receiver.email.value }),
      'EX',
      getCacheTime(CacheTimes.OneWeek),
    )

    const input: ValidateEmployeeMailTokenRequest = {
      email: receiver.email.value,
      token: loginToken,
    }
    await requests.validateEmployeeMailToken(input).expect(
      expectEqualResult(
        (data: ResolverResponseClass<boolean, TokenExpiredError>) => {
          expect(data.result).toBeTruthy()
          expect(data.error).toBeFalsy()
        },
      ),
    )
  })

  it('Should not validate email bacause wrong token', async () => {
    const [user, organization] = (await Promise.all([
      UserFactory.saveOne(app, {
        role: UserRoles.employee,
      }),
      OrganizationFactory.saveOne(app),
    ])) as [UserEntity, OrganizationEntity]
    const [receiver, employee] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: user.id,
      }),
      EmployeeFactory.saveOne(app, {
        organizationId: organization.id,
        userId: user.id,
      }),
    ])) as [ReceiverEntity, EmployeeEntity]

    const loginToken = cryptoRandomString({ length: 10, type: 'numeric' })

    await services.redis.persist.set(
      loginToken,
      JSON.stringify({ email: receiver.email.value }),
      'EX',
      getCacheTime(CacheTimes.OneWeek),
    )

    const input: ValidateEmployeeMailTokenRequest = {
      email: receiver.email.value,
      token: cryptoRandomString({ length: 10, type: 'numeric' }),
    }
    await requests.validateEmployeeMailToken(input).expect(
      expectEqualResult(
        (data: ResolverResponseClass<boolean, TokenExpiredError>) => {
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        },
      ),
    )
  })

  it('Should not validate as unexisting employee', async () => {
    const input: ValidateEmployeeMailTokenRequest = {
      email: faker.internet.email(),
      token: 'aabababab',
    }
    await requests.validateEmployeeMailToken(input).expect(
      expectEqualResult(
        (data: ResolverResponseClass<boolean, TokenExpiredError>) => {
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
