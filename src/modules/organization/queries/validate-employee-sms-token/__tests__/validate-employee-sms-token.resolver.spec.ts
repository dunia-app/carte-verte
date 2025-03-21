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
import { WrongSmsCodeError } from '../../../errors/employee.errors'
import { OrganizationModule } from '../../../organization.module'
import { ValidateEmployeeSmsTokenRequest } from '../validate-employee-sms-token.request.dto'
import { buildValidateEmployeeSmsTokenRequests } from './validate-employee-sms-token.requests'

describe('ValidateEmployeeSmsToken (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    employeeRepo: EmployeeRepository,
  })

  let requests: ReturnType<typeof buildValidateEmployeeSmsTokenRequests>

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
    requests = buildValidateEmployeeSmsTokenRequests(app)
  })

  it('Should validate sms', async () => {
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

    const mobileToken = cryptoRandomString({ length: 10, type: 'numeric' })
    const code = cryptoRandomString({ length: 6, type: 'numeric' })

    const authInfo = {
      code,
      mobile: faker.phone.number(),
      email: faker.internet.email(),
      employeeId: employee.id,
      deviceId: 'test-id',
    }

    await services.redis.persist.set(
      mobileToken,
      JSON.stringify(authInfo),
      'EX',
      getCacheTime(CacheTimes.FifteenMinutes),
    )

    const input: ValidateEmployeeSmsTokenRequest = {
      mobileToken: mobileToken,
      mobileCode: code,
    }

    await requests.validateEmployeeSmsToken(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            String,
            [TokenExpiredError, WrongSmsCodeError]
          >,
        ) => {
          expect(data.result).toBeTruthy()
          expect(data.error).toBeFalsy()
        },
      ),
    )
  })

  it('Should not validate email bacause wrong code', async () => {
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

    const mobileToken = cryptoRandomString({ length: 10, type: 'numeric' })
    const code = cryptoRandomString({ length: 6, type: 'numeric' })

    const authInfo = {
      code,
      mobile: faker.phone.number(),
      email: faker.internet.email,
      employeeId: employee.id,
      deviceId: 'test-id',
    }

    await services.redis.persist.set(
      mobileToken,
      JSON.stringify(authInfo),
      'EX',
      getCacheTime(CacheTimes.FifteenMinutes),
    )

    const input: ValidateEmployeeSmsTokenRequest = {
      mobileToken: mobileToken,
      mobileCode: cryptoRandomString({ length: 6, type: 'numeric' }),
    }

    await requests.validateEmployeeSmsToken(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            String,
            [TokenExpiredError, WrongSmsCodeError]
          >,
        ) => {
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
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

    const mobileToken = cryptoRandomString({ length: 10, type: 'numeric' })
    const code = cryptoRandomString({ length: 6, type: 'numeric' })

    const authInfo = {
      code,
      mobile: faker.phone.number(),
      email: faker.internet.email,
      employeeId: employee.id,
      deviceId: 'test-id',
    }

    await services.redis.persist.set(
      mobileToken,
      JSON.stringify(authInfo),
      'EX',
      getCacheTime(CacheTimes.FifteenMinutes),
    )

    const input: ValidateEmployeeSmsTokenRequest = {
      mobileToken: cryptoRandomString({ length: 10, type: 'numeric' }),
      mobileCode: code,
    }

    await requests.validateEmployeeSmsToken(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            String,
            [TokenExpiredError, WrongSmsCodeError]
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
