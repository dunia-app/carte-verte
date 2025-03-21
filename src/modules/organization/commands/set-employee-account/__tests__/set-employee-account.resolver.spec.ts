import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import cryptoRandomString from 'crypto-random-string'
import { CacheTimes, getCacheTime } from '../../../../../helpers/cache.helper'
import { TokenExpiredError } from '../../../../../infrastructure/redis/redis.errors'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
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
import { EmployeeRepository } from '../../../database/employee/employee.repository'
import { EmployeeEntity } from '../../../domain/entities/employee.entity'
import { EmployeeFactory } from '../../../domain/entities/employee.factory'
import { OrganizationEntity } from '../../../domain/entities/organization.entity'
import { OrganizationFactory } from '../../../domain/entities/organization.factory'
import {
  EmployeeCodeFormatNotCorrectError,
  EmployeeFrozenError,
  EmployeeNewDeviceNotValidated,
  EmployeeNotActivatedError,
} from '../../../errors/employee.errors'
import { OrganizationModule } from '../../../organization.module'
import { SetEmployeeAccountRequest } from '../set-employee-account.request.dto'
import { buildSetEmployeeAccountRequests } from './set-employee-account.requests'

describe('SetEmployeeCode (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    employeeRepo: EmployeeRepository,
  })

  let requests: ReturnType<typeof buildSetEmployeeAccountRequests>

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
    requests = buildSetEmployeeAccountRequests(app)
  })

  it('Should set employee code', async () => {
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
    const phoneNumber = faker.phone.number()

    await services.redis.persist.set(
      loginToken,
      JSON.stringify({ email: receiver.email.value }),
      'EX',
      getCacheTime(CacheTimes.OneWeek),
    )

    await services.redis.persist.set(
      `smsTokenValidated:${receiver.email.value}`,
      JSON.stringify({
        mobile: phoneNumber,
        deviceId: 'test-id',
      }),
      'EX',
      getCacheTime(CacheTimes.FifteenMinutes),
    )

    const input: SetEmployeeAccountRequest = {
      code: '1234',
      deviceId: 'test-id',
      email: receiver.email.value,
      token: loginToken,
    }

    await requests.setEmployeeCode(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            [
              TokenExpiredError,
              EmployeeNewDeviceNotValidated,
              EmployeeCodeFormatNotCorrectError,
              EmployeeNotActivatedError,
              EmployeeFrozenError,
            ]
          >,
        ) => {
          expect(data.result).toBeTruthy()
          expect(data.error).toBeFalsy()
        },
      ),
    )
  })

  it('Should not set employee code because not same deviceId', async () => {
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
    const phoneNumber = faker.phone.number()

    await services.redis.persist.set(
      loginToken,
      JSON.stringify({ email: receiver.email.value }),
      'EX',
      getCacheTime(CacheTimes.OneWeek),
    )

    await services.redis.persist.set(
      `smsTokenValidated:${receiver.email.value}`,
      JSON.stringify({
        mobile: phoneNumber,
        deviceId: 'test-id',
      }),
      'EX',
      getCacheTime(CacheTimes.FifteenMinutes),
    )

    const input: SetEmployeeAccountRequest = {
      code: '1234',
      deviceId: 'test-id-wrong',
      email: receiver.email.value,
      token: loginToken,
    }

    await requests.setEmployeeCode(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            [
              TokenExpiredError,
              EmployeeNewDeviceNotValidated,
              EmployeeCodeFormatNotCorrectError,
              EmployeeNotActivatedError,
              EmployeeFrozenError,
            ]
          >,
        ) => {
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        },
      ),
    )
  })

  it('Should not set employee code because wrong code format', async () => {
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
    const phoneNumber = faker.phone.number()

    await services.redis.persist.set(
      loginToken,
      JSON.stringify({ email: receiver.email.value }),
      'EX',
      getCacheTime(CacheTimes.OneWeek),
    )

    await services.redis.persist.set(
      `smsTokenValidated:${receiver.email.value}`,
      JSON.stringify({
        mobile: phoneNumber,
        deviceId: 'test-id',
      }),
      'EX',
      getCacheTime(CacheTimes.FifteenMinutes),
    )

    const input: SetEmployeeAccountRequest = {
      code: '123456',
      deviceId: 'test-id',
      email: receiver.email.value,
      token: loginToken,
    }

    await requests.setEmployeeCode(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            [
              TokenExpiredError,
              EmployeeNewDeviceNotValidated,
              EmployeeCodeFormatNotCorrectError,
              EmployeeNotActivatedError,
              EmployeeFrozenError,
            ]
          >,
        ) => {
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        },
      ),
    )
  })

  it('Should not set employee code because mobile token expired', async () => {
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

    const input: SetEmployeeAccountRequest = {
      code: '123456',
      deviceId: 'test-id',
      email: receiver.email.value,
      token: loginToken,
    }

    await requests.setEmployeeCode(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            [
              TokenExpiredError,
              EmployeeNewDeviceNotValidated,
              EmployeeCodeFormatNotCorrectError,
              EmployeeNotActivatedError,
              EmployeeFrozenError,
            ]
          >,
        ) => {
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        },
      ),
    )
  })

  it('Should not set employee code because email token expired', async () => {
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
    const phoneNumber = faker.phone.number()

    await services.redis.persist.set(
      `smsTokenValidated:${receiver.email.value}`,
      JSON.stringify({
        mobile: phoneNumber,
        deviceId: 'test-id',
      }),
      'EX',
      getCacheTime(CacheTimes.FifteenMinutes),
    )

    const input: SetEmployeeAccountRequest = {
      code: '123456',
      deviceId: 'test-id',
      email: receiver.email.value,
      token: loginToken,
    }

    await requests.setEmployeeCode(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            [
              TokenExpiredError,
              EmployeeNewDeviceNotValidated,
              EmployeeCodeFormatNotCorrectError,
              EmployeeNotActivatedError,
              EmployeeFrozenError,
            ]
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
