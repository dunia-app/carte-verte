import { INestApplication } from '@nestjs/common'
import moment from 'moment'
import redlock from 'redlock'
import { Baas } from '../../../../infrastructure/baas/baas'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { EventOrmEntity } from '../../../../libs/ddd/domain/domain-events/entities/event.orm-entity'
import { mockBaas } from '../../../../libs/ddd/domain/ports/baas.port.mock'
import { DateVO } from '../../../../libs/ddd/domain/value-objects/date.value-object'
import {
  onboardAsEmployee,
  onboardAsOrganizationAdmin,
} from '../../../../tests/auth_users'
import { testDataSource } from '../../../../tests/test_data_source'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../tests/test_utils'
import { CardModule } from '../../../card/card.module'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { TransactionModule } from '../../../transaction/transaction.module'
import { UserRepository } from '../../../user/database/user/user.repository'
import { WalletRepository } from '../../../wallet/database/wallet/wallet.repository'
import { Balance } from '../../../wallet/domain/value-objects/balance.value-object'
import { WalletModule } from '../../../wallet/wallet.module'
import { EmployeeRepository } from '../../database/employee/employee.repository'
import { OrganizationAdminRepository } from '../../database/organization-admin/organization-admin.repository'
import { DeleteRemovedEmployeesTaskHandler } from './delete-removed-employees.task-handler'

describe('DeleteRemovedEmployees (Task Handler)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    employeeRepo: EmployeeRepository,
    organizationAdminRepo: OrganizationAdminRepository,
    walletRepo: WalletRepository,
    userRepo: UserRepository,
    baas: Baas,
    handler: DeleteRemovedEmployeesTaskHandler,
  })

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [WalletModule, CardModule, TransactionModule],
      },
      services,
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()
    mockBaas(services.baas)

    jest
      .spyOn(services.redis.redlock, 'lock')
      .mockResolvedValue({} as redlock.Lock)
  })

  it('Should remove the employee', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      {
        willBeDeletedAt: new DateVO(new Date()),
      },
      {
        balance: new Balance(0),
        authorizedBalance: new Balance(0),
      },
    )

    await services.handler.handleEmployeesToBeDeleted()

    const [employeeSaved, walletSaved, userSaved, eventSaved] =
      await Promise.all([
        services.employeeRepo.findOneById(authInfo.user.id.value),
        services.walletRepo.findManyByEmployeeId(authInfo.user.id.value),
        services.userRepo.findOneById(authInfo.user.userId.value),
        (
          await testDataSource
        )
          .getRepository(EventOrmEntity)
          .createQueryBuilder()
          .where({ eventName: 'EmployeeDeletedDomainEvent' })
          .andWhere('variables @> :variables', {
            variables: { organizationId: authInfo.user.organizationId.value },
          })
          .getOne(),
      ])

    expect(employeeSaved).toBeFalsy()
    expect(walletSaved.length).toBe(0)
    expect(userSaved).toBeFalsy()

    expect(eventSaved?.variables.aggregateId).toBe(authInfo.user.id.value)
  })

  it('Should not remove the employee', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    await services.handler.handleEmployeesToBeDeleted()

    const [employeeSaved, walletSaved, userSaved] = await Promise.all([
      services.employeeRepo.findOneByIdOrThrow(authInfo.user.id.value),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.userRepo.findOneByIdOrThrow(authInfo.user.userId.value),
    ])
    expect(employeeSaved).toBeTruthy()
    expect(walletSaved).toBeTruthy()
    expect(userSaved).toBeTruthy()
  })

  it('Should not remove the employee yet', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(app, {
      willBeDeletedAt: new DateVO(moment().add(1, 'day').toDate()),
    })

    await services.handler.handleEmployeesToBeDeleted()

    const [employeeSaved, walletSaved, userSaved] = await Promise.all([
      services.employeeRepo.findOneByIdOrThrow(authInfo.user.id.value),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.userRepo.findOneByIdOrThrow(authInfo.user.userId.value),
    ])
    expect(employeeSaved).toBeTruthy()
    expect(walletSaved).toBeTruthy()
    expect(userSaved).toBeTruthy()
  })

  it('Should not remove the employee cause balance is not empty', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      {
        willBeDeletedAt: new DateVO(new Date()),
      },
      {
        balance: new Balance(10),
        authorizedBalance: new Balance(10),
      },
    )

    await services.handler.handleEmployeesToBeDeleted()

    const [employeeSaved, walletSaved, userSaved] = await Promise.all([
      services.employeeRepo.findOneByIdOrThrow(authInfo.user.id.value),
      services.walletRepo.findOneByEmployeeIdAndAdvantageOrThrow(
        authInfo.user.id.value,
        AdvantageType.MEALTICKET,
      ),
      services.userRepo.findOneByIdOrThrow(authInfo.user.userId.value),
    ])
    expect(employeeSaved).toBeTruthy()
    expect(walletSaved).toBeTruthy()
    expect(userSaved).toBeTruthy()
  })

  it('Should remove the employee but not the user cause it is also an admin', async () => {
    const adminAuthInfo = await onboardAsOrganizationAdmin(app, {})
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      {
        userId: adminAuthInfo.user.userId,
        willBeDeletedAt: new DateVO(new Date()),
      },
      {
        balance: new Balance(0),
        authorizedBalance: new Balance(0),
      },
    )

    await services.handler.handleEmployeesToBeDeleted()

    const [
      employeeSaved,
      walletSaved,
      userSaved,
      organizationAdminSaved,
      eventSaved,
    ] = await Promise.all([
      services.employeeRepo.findOneById(authInfo.user.id.value),
      services.walletRepo.findManyByEmployeeId(authInfo.user.id.value),
      services.userRepo.findOneByIdOrThrow(authInfo.user.userId.value),
      services.organizationAdminRepo.findOneByIdOrThrow(
        adminAuthInfo.user.id.value,
      ),
      (
        await testDataSource
      )
        .getRepository(EventOrmEntity)
        .createQueryBuilder()
        .where({ eventName: 'EmployeeDeletedDomainEvent' })
        .andWhere('variables @> :variables', {
          variables: { organizationId: authInfo.user.organizationId.value },
        })
        .getOne(),
    ])
    expect(employeeSaved).toBeFalsy()
    expect(walletSaved.length).toBe(0)

    expect(userSaved).toBeTruthy()
    expect(organizationAdminSaved).toBeTruthy()

    expect(eventSaved?.variables.aggregateId).toBe(authInfo.user.id.value)
  })

  afterAll(async () => {
    ;(await testDataSource).destroy()
    await app.close()
  })
})