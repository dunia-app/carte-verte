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
import { EmployeeEntity } from '../../../domain/entities/employee.entity'
import { EmployeeFactory } from '../../../domain/entities/employee.factory'
import { EmployeeStatus } from '../../../domain/entities/employee.types'
import { OrganizationEntity } from '../../../domain/entities/organization.entity'
import { OrganizationFactory } from '../../../domain/entities/organization.factory'
import { EmployeeCode } from '../../../domain/value-objects/employee-code.value-object'
import {
  EmployeeFrozenError,
  EmployeeNotActivatedError,
  EmployeeNotFoundError,
  WrongEmployeeCodeError,
} from '../../../errors/employee.errors'
import { OrganizationModule } from '../../../organization.module'
import { LoginEmployeeRequest } from '../login-employee.request.dto'
import { buildLoginEmployeeRequests } from './login-employee.requests'

describe('LoginEmployee (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
  })

  let requests: ReturnType<typeof buildLoginEmployeeRequests>
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
    requests = buildLoginEmployeeRequests(app)
    saltRound = new ConfigService().getSaltRound()
  })

  it('Should get a login token as employee without cgu', async () => {
    const [user, organization] = (await Promise.all([
      UserFactory.saveOne(app, {
        role: UserRoles.employee,
      }),
      OrganizationFactory.saveOne(app),
    ])) as [UserEntity, OrganizationEntity]
    const [receiver, _employee] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: user.id,
      }),
      EmployeeFactory.saveOne(app, {
        organizationId: organization.id,
        userId: user.id,
        activatedAt: new DateVO(new Date()),
        code: new EmployeeCode(bcrypt.hashSync('1234', saltRound)),
      }),
    ])) as [ReceiverEntity, EmployeeEntity]

    await requests.employeeStatus(receiver.email.value).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<EmployeeStatus, EmployeeNotFoundError>,
        ) => {
          expect(data.result).toBe(EmployeeStatus.EMPLOYEE_NO_CGU)
        },
      ),
    )

    const input: LoginEmployeeRequest = {
      email: receiver.email.value,
      code: '1234',
    }
    await requests.loginEmployee(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            | EmployeeNotActivatedError
            | WrongEmployeeCodeError
            | EmployeeFrozenError
            | EmployeeNotFoundError
          >,
        ) => {
          expect(data.result).toBeTruthy()
          expect(data.error).toBeFalsy()
        },
      ),
    )
  })

  it('Should get a login token as employee and activated', async () => {
    const [user, organization] = (await Promise.all([
      UserFactory.saveOne(app, {
        role: UserRoles.employee,
      }),
      OrganizationFactory.saveOne(app),
    ])) as [UserEntity, OrganizationEntity]
    const [receiver, _employee] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: user.id,
      }),
      EmployeeFactory.saveOne(app, {
        organizationId: organization.id,
        userId: user.id,
        activatedAt: new DateVO(new Date()),
        code: new EmployeeCode(bcrypt.hashSync('1234', saltRound)),
        cguAcceptedAt: new DateVO(new Date()),
      }),
    ])) as [ReceiverEntity, EmployeeEntity]

    await requests.employeeStatus(receiver.email.value).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<EmployeeStatus, EmployeeNotFoundError>,
        ) => {
          expect(data.result).toBe(EmployeeStatus.EMPLOYEE_ACTIVE)
        },
      ),
    )

    const input: LoginEmployeeRequest = {
      email: receiver.email.value,
      code: '1234',
    }
    await requests.loginEmployee(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            | EmployeeNotActivatedError
            | WrongEmployeeCodeError
            | EmployeeFrozenError
            | EmployeeNotFoundError
          >,
        ) => {
          expect(data.result).toBeTruthy()
          expect(data.error).toBeFalsy()
        },
      ),
    )
  })

  it('Should not get a login token as frozen employee', async () => {
    const [user, organization] = (await Promise.all([
      UserFactory.saveOne(app, {
        role: UserRoles.employee,
      }),
      OrganizationFactory.saveOne(app),
    ])) as [UserEntity, OrganizationEntity]
    const [receiver, _employee] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: user.id,
      }),
      EmployeeFactory.saveOne(app, {
        organizationId: organization.id,
        userId: user.id,
        activatedAt: new DateVO(new Date()),
        code: new EmployeeCode(bcrypt.hashSync('1234', saltRound)),
        freezedAt: new DateVO(new Date()),
      }),
    ])) as [ReceiverEntity, EmployeeEntity]

    const input: LoginEmployeeRequest = {
      email: receiver.email.value,
      code: '1234',
    }
    await requests.loginEmployee(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            | EmployeeNotActivatedError
            | WrongEmployeeCodeError
            | EmployeeFrozenError
            | EmployeeNotFoundError
          >,
        ) => {
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        },
      ),
    )
  })

  it('Should not get a login token as unactivated employee', async () => {
    const [user, organization] = (await Promise.all([
      UserFactory.saveOne(app, {
        role: UserRoles.employee,
      }),
      OrganizationFactory.saveOne(app),
    ])) as [UserEntity, OrganizationEntity]
    const [receiver, _employee] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: user.id,
      }),
      EmployeeFactory.saveOne(app, {
        organizationId: organization.id,
        userId: user.id,
      }),
    ])) as [ReceiverEntity, EmployeeEntity]

    const input: LoginEmployeeRequest = {
      email: receiver.email.value,
      code: '1234',
    }

    await requests.employeeStatus(receiver.email.value).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<EmployeeStatus, EmployeeNotFoundError>,
        ) => {
          expect(data.result).toBe(EmployeeStatus.EMPLOYEE_UNACTIVE)
        },
      ),
    )

    await requests.loginEmployee(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            | EmployeeNotActivatedError
            | WrongEmployeeCodeError
            | EmployeeFrozenError
            | EmployeeNotFoundError
          >,
        ) => {
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        },
      ),
    )
  })

  it('Should not get a login token as wrong code employee', async () => {
    const [user, organization] = (await Promise.all([
      UserFactory.saveOne(app, {
        role: UserRoles.employee,
      }),
      OrganizationFactory.saveOne(app),
    ])) as [UserEntity, OrganizationEntity]
    const [receiver, _employee] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: user.id,
      }),
      EmployeeFactory.saveOne(app, {
        organizationId: organization.id,
        userId: user.id,
        activatedAt: new DateVO(new Date()),
        code: new EmployeeCode(bcrypt.hashSync('1234', saltRound)),
      }),
    ])) as [ReceiverEntity, EmployeeEntity]

    const input: LoginEmployeeRequest = {
      email: receiver.email.value,
      code: '0000',
    }
    await requests.loginEmployee(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            | EmployeeNotActivatedError
            | WrongEmployeeCodeError
            | EmployeeFrozenError
            | EmployeeNotFoundError
          >,
        ) => {
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        },
      ),
    )
  })

  it('Should not get a login token as unexisting employee', async () => {
    const input: LoginEmployeeRequest = {
      email: faker.internet.email(),
      code: '0000',
    }
    await requests.loginEmployee(input).expect(
      expectEqualResult((data: undefined) => {
        expect(data).toBeFalsy()
      }),
    )
  })

  it('Should get a login token because saved deviceId', async () => {
    const [user, organization] = (await Promise.all([
      UserFactory.saveOne(app, {
        role: UserRoles.employee,
      }),
      OrganizationFactory.saveOne(app),
    ])) as [UserEntity, OrganizationEntity]
    const [receiver, _employee] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: user.id,
      }),
      EmployeeFactory.saveOne(app, {
        organizationId: organization.id,
        userId: user.id,
        activatedAt: new DateVO(new Date()),
        code: new EmployeeCode(bcrypt.hashSync('1234', saltRound)),
        deviceIds: ['test-id'],
      }),
    ])) as [ReceiverEntity, EmployeeEntity]

    const input: LoginEmployeeRequest = {
      email: receiver.email.value,
      code: '0000',
      deviceId: 'test-id',
    }
    await requests.loginEmployee(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            | EmployeeNotActivatedError
            | WrongEmployeeCodeError
            | EmployeeFrozenError
            | EmployeeNotFoundError
          >,
        ) => {
          expect(data.result).toBeFalsy()
          expect(data.error).toBeTruthy()
        },
      ),
    )
  })

  it('Should not get a login token because new deviceId', async () => {
    const [user, organization] = (await Promise.all([
      UserFactory.saveOne(app, {
        role: UserRoles.employee,
      }),
      OrganizationFactory.saveOne(app),
    ])) as [UserEntity, OrganizationEntity]
    const [receiver, _employee] = (await Promise.all([
      ReceiverFactory.saveOne(app, {
        userId: user.id,
      }),
      EmployeeFactory.saveOne(app, {
        organizationId: organization.id,
        userId: user.id,
        activatedAt: new DateVO(new Date()),
        code: new EmployeeCode(bcrypt.hashSync('1234', saltRound)),
      }),
    ])) as [ReceiverEntity, EmployeeEntity]

    const input: LoginEmployeeRequest = {
      email: receiver.email.value,
      code: '0000',
      deviceId: 'test-id',
    }
    await requests.loginEmployee(input).expect(
      expectEqualResult(
        (
          data: ResolverResponseClass<
            LoginResponse,
            | EmployeeNotActivatedError
            | WrongEmployeeCodeError
            | EmployeeFrozenError
            | EmployeeNotFoundError
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
