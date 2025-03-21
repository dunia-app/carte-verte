import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
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
import { EmployeeEntity } from '../../../domain/entities/employee.entity'
import { EmployeeFactory } from '../../../domain/entities/employee.factory'
import { OrganizationEntity } from '../../../domain/entities/organization.entity'
import { OrganizationFactory } from '../../../domain/entities/organization.factory'
import {
    EmployeeAlreadyExistsError,
    EmployeeEmailDuplicatedError,
    EmployeeNameNotValideError,
} from '../../../errors/employee.errors'
import { OrganizationModule } from '../../../organization.module'
import { CreateEmployeeRequest } from '../create-employee.request.dto'
import { buildCreateEmployeeRequests } from './create-employee.requests'

describe('CreateEmployee (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
  })

  let requests: ReturnType<typeof buildCreateEmployeeRequests>

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
    requests = buildCreateEmployeeRequests(app)
  })

  test('Should create new employee', async () => {
    const authInfo = await loginAsOrganizationAdmin(app)

    const input: CreateEmployeeRequest = {
      email: faker.internet.email(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      birthday: faker.date.anytime(),
      mealTicketDays: {
        MONDAY: true,
        TUESDAY: true,
        WEDNESDAY: true,
        THURSDAY: true,
        FRIDAY: true,
        SATURDAY: false,
        SUNDAY: false,
      },
    }

    await requests
      .createEmployee([input])
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              String,
              | EmployeeAlreadyExistsError
              | EmployeeNameNotValideError
              | EmployeeEmailDuplicatedError
            >[],
          ) => {
            expect(data.length).toBe(1)
            expect(data[0].result).toBeTruthy()
            expect(data[0].error).toBeFalsy()
          },
        ),
      )
  })

  it('Should not create an existing employee', async () => {
    const authInfo = await loginAsOrganizationAdmin(app)
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

    const input: CreateEmployeeRequest = {
      email: receiver.email.value,
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      birthday: faker.date.anytime(),
      mealTicketDays: {
        MONDAY: true,
        TUESDAY: true,
        WEDNESDAY: true,
        THURSDAY: true,
        FRIDAY: true,
        SATURDAY: false,
        SUNDAY: false,
      },
    }

    await requests
      .createEmployee([input])
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              String,
              | EmployeeAlreadyExistsError
              | EmployeeNameNotValideError
              | EmployeeEmailDuplicatedError
            >[],
          ) => {
            expect(data.length).toBe(1)
            expect(data[0].result).toBeFalsy()
            expect(data[0].error).toBeTruthy()
          },
        ),
      )
  })

  it('Should not create wrong name employee', async () => {
    const authInfo = await loginAsOrganizationAdmin(app)

    const input: CreateEmployeeRequest = {
      email: faker.internet.email(),
      firstname: 'u',
      lastname: faker.person.lastName(),
      birthday: faker.date.anytime(),
      mealTicketDays: {
        MONDAY: true,
        TUESDAY: true,
        WEDNESDAY: true,
        THURSDAY: true,
        FRIDAY: true,
        SATURDAY: false,
        SUNDAY: false,
      },
    }

    await requests
      .createEmployee([input])
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              String,
              | EmployeeAlreadyExistsError
              | EmployeeNameNotValideError
              | EmployeeEmailDuplicatedError
            >[],
          ) => {
            expect(data.length).toBe(1)
            expect(data[0].result).toBeFalsy()
            expect(data[0].error).toBeTruthy()
          },
        ),
      )
  })

  it('Should not create duplicated employees', async () => {
    const authInfo = await loginAsOrganizationAdmin(app)

    const input: CreateEmployeeRequest = {
      email: faker.internet.email(),
      firstname: faker.person.firstName(),
      lastname: faker.person.lastName(),
      birthday: faker.date.anytime(),
      mealTicketDays: {
        MONDAY: true,
        TUESDAY: true,
        WEDNESDAY: true,
        THURSDAY: true,
        FRIDAY: true,
        SATURDAY: false,
        SUNDAY: false,
      },
    }

    await requests
      .createEmployee([input, input])
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              String,
              | EmployeeAlreadyExistsError
              | EmployeeNameNotValideError
              | EmployeeEmailDuplicatedError
            >[],
          ) => {
            expect(data.length).toBe(1)
            expect(data[0].result).toBeFalsy()
            expect(data[0].error).toBeTruthy()
          },
        ),
      )
  })

  afterAll(async () => {
    await app.close()
  })
})
