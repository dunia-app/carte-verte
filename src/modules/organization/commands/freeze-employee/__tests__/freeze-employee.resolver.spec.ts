import { INestApplication } from '@nestjs/common'
// import { testDataSource } from '../../../../../../tests/testDataSource'
import { Baas } from '../../../../../infrastructure/baas/baas'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { EventOrmEntity } from '../../../../../libs/ddd/domain/domain-events/entities/event.orm-entity'
import { mockBaas } from '../../../../../libs/ddd/domain/ports/baas.port.mock'
import { DateVO } from '../../../../../libs/ddd/domain/value-objects/date.value-object'
import { ResolverResponseClass } from '../../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import {
  loginAsSuperAdmin,
  onboardAsEmployee,
} from '../../../../../tests/auth_users'
import { expectEqualResult } from '../../../../../tests/helpers/requests_helpers'
import { testDataSource } from '../../../../../tests/test_data_source'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../../tests/test_utils'
import { CardModule } from '../../../../card/card.module'
import { CardRepository } from '../../../../card/database/card/card.repository'
import { LockStatus } from '../../../../card/domain/entities/card.types'
import { WalletModule } from '../../../../wallet/wallet.module'
import { EmployeeRepository } from '../../../database/employee/employee.repository'
import { EmployeeAlreadyFrozenError } from '../../../errors/employee.errors'
import { OrganizationModule } from '../../../organization.module'
import { buildFreezeEmployeeRequests } from './freeze-employee.request'

describe('FreezeEmployee (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    employeeRepo: EmployeeRepository,
    cardRepo: CardRepository,
    baas: Baas,
  })

  let requests: ReturnType<typeof buildFreezeEmployeeRequests>
  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [WalletModule, CardModule, OrganizationModule],
      },
      services,
    )
    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()
    requests = buildFreezeEmployeeRequests(app)
    mockBaas(services.baas)
  })

  it('Should freeze the user and store the event', async () => {
    const superAdminAuth = await loginAsSuperAdmin(app)
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    await requests
      .freezeEmployee(authInfo.user.id.value)
      .set(superAdminAuth.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<boolean, EmployeeAlreadyFrozenError>,
          ) => {
            expect(data.result).toBe(true)
            expect(data.error).toBeFalsy()
          },
        ),
      )

    const [employeeSaved, cardSaved, eventSaved] = await Promise.all([
      services.employeeRepo.findOneByIdOrThrow(authInfo.user.id.value),
      services.cardRepo.findOneByIdOrThrow(card.id.value),
      (
        await testDataSource
      )
        .getRepository(EventOrmEntity)
        .createQueryBuilder()
        .where({ eventName: 'EmployeeFrozenDomainEvent' })
        .andWhere('variables @> :variables', {
          variables: { aggregateId: authInfo.user.id.value },
        })
        .getOne(),
    ])
    expect(employeeSaved.getPropsCopy().freezedAt).toBeTruthy()
    expect(cardSaved.lockStatus).toBe(LockStatus.LOCK)
    expect(eventSaved).toBeTruthy()
  })

  it('Should not freeze the user and not store the event', async () => {
    const superAdminAuth = await loginAsSuperAdmin(app)
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      {
        freezedAt: new DateVO(new Date()),
      },
      undefined,
      {
        lockStatus: LockStatus.LOCK,
      },
    )

    await requests
      .freezeEmployee(authInfo.user.id.value)
      .set(superAdminAuth.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<boolean, EmployeeAlreadyFrozenError>,
          ) => {
            expect(data.result).toBeFalsy()
            expect(data.error!.code).toBe(new EmployeeAlreadyFrozenError().code)
          },
        ),
      )

    const eventSaved = await (
      await testDataSource
    )
      .getRepository(EventOrmEntity)
      .createQueryBuilder()
      .where({ eventName: 'EmployeeFrozenDomainEvent' })
      .andWhere('variables @> :variables', {
        variables: { aggregateId: authInfo.user.id.value },
      })
      .getOne()
    expect(eventSaved).toBeFalsy()
  })

  afterAll(async () => {
    ;(await testDataSource).destroy()
    await app.close()
  })
})