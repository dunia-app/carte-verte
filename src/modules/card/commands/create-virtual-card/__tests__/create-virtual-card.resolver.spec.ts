import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { Baas } from '../../../../../infrastructure/baas/baas'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { EventOrmEntity } from '../../../../../libs/ddd/domain/domain-events/entities/event.orm-entity'
import { UserOrWalletNotFoundOrNotActiveError } from '../../../../../libs/ddd/domain/ports/baas.port'
import { mockBaas } from '../../../../../libs/ddd/domain/ports/baas.port.mock'
import { DateVO } from '../../../../../libs/ddd/domain/value-objects/date.value-object'
import { ResolverResponseClass } from '../../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import {
  loginAsEmployee,
  onboardAsEmployee,
} from '../../../../../tests/auth_users'
import { expectEqualResult } from '../../../../../tests/helpers/requests_helpers'
import { testDataSource } from '../../../../../tests/test_data_source'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../../tests/test_utils'
import { EmployeeCode } from '../../../../organization/domain/value-objects/employee-code.value-object'
import { EmployeeHasNotAcceptedCguError } from '../../../../organization/errors/employee.errors'
import { WalletModule } from '../../../../wallet/wallet.module'
import { CardModule } from '../../../card.module'
import { CardRepository } from '../../../database/card/card.repository'
import { LockStatus } from '../../../domain/entities/card.types'
import { CardAlreadyExistsError } from '../../../errors/card.errors'
import { buildCreateVirtualCardRequests } from './create-virtual-card.request'

describe('CreateVirtualCard (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    cardRepo: CardRepository,
    baas: Baas,
  })

  let requests: ReturnType<typeof buildCreateVirtualCardRequests>
  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [WalletModule, CardModule],
      },
      services,
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()
    requests = buildCreateVirtualCardRequests(app)
    mockBaas(services.baas)
  })

  it('Should create a virtual card', async () => {
    const { authInfo, wallet } = await loginAsEmployee(app, {
      activatedAt: new DateVO(new Date()),
      cguAcceptedAt: new DateVO(new Date()),
      code: new EmployeeCode(faker.string.numeric(4)),
    })

    await requests
      .createVirtualCard()
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              String,
              | CardAlreadyExistsError
              | UserOrWalletNotFoundOrNotActiveError
              | EmployeeHasNotAcceptedCguError
            >,
          ) => {
            expect(data.result).toBeTruthy()
            expect(data.error).toBeFalsy()
          },
        ),
      )

    const [cardSaved, eventSaved] = await Promise.all([
      services.cardRepo.findCurrentOneByEmployeeIdOrThrow(
        authInfo.user.id.value,
      ),
      (
        await testDataSource
      )
        .getRepository(EventOrmEntity)
        .createQueryBuilder()
        .where({ eventName: 'CardCreatedDomainEvent' })
        .andWhere('variables @> :variables', {
          variables: { employeeId: authInfo.user.id.value },
        })
        .getOne(),
    ])
    expect(cardSaved).toBeTruthy()
    expect(eventSaved).toBeTruthy()
  })

  it('Should create a new virtual card cause user lost the previous one', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      undefined,
      {
        lockStatus: LockStatus.LOST,
        blockedAt: new DateVO(new Date()),
      },
    )

    await requests
      .createVirtualCard()
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              String,
              | CardAlreadyExistsError
              | UserOrWalletNotFoundOrNotActiveError
              | EmployeeHasNotAcceptedCguError
            >,
          ) => {
            expect(data.result).toBeTruthy()
            expect(data.error).toBeFalsy()
          },
        ),
      )

    const [cardSaved, eventSaved] = await Promise.all([
      services.cardRepo.findCurrentOneByEmployeeIdOrThrow(
        authInfo.user.id.value,
      ),
      (
        await testDataSource
      )
        .getRepository(EventOrmEntity)
        .createQueryBuilder()
        .where({ eventName: 'CardCreatedDomainEvent' })
        .andWhere('variables @> :variables', {
          variables: { employeeId: authInfo.user.id.value },
        })
        .getOne(),
    ])
    expect(cardSaved).toBeTruthy()
    expect(eventSaved).toBeTruthy()
  })

  it('Should reject creating a virtual card cause user has not accepted cgu', async () => {
    const { authInfo, wallet } = await loginAsEmployee(app, {
      activatedAt: new DateVO(new Date()),
      code: new EmployeeCode(faker.string.numeric(4)),
    })

    await requests
      .createVirtualCard()
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              String,
              | CardAlreadyExistsError
              | UserOrWalletNotFoundOrNotActiveError
              | EmployeeHasNotAcceptedCguError
            >,
          ) => {
            expect(data.result).toBeFalsy()
            expect(data.error!.code).toBe(
              new EmployeeHasNotAcceptedCguError().code,
            )
          },
        ),
      )
    try {
      const cardSaved =
        await services.cardRepo.findCurrentOneByEmployeeIdOrThrow(
          authInfo.user.id.value,
        )
      expect(cardSaved).toBeFalsy()
    } catch (e) {}

    const eventSaved = await (
      await testDataSource
    )
      .getRepository(EventOrmEntity)
      .createQueryBuilder()
      .where({ eventName: 'CardCreatedDomainEvent' })
      .andWhere('variables @> :variables', {
        variables: { employeeId: authInfo.user.id.value },
      })
      .getOne()
    expect(eventSaved).toBeFalsy()
  })

  it('Should reject creating a virtual card cause user already has one not blocked', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    await requests
      .createVirtualCard()
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<
              String,
              | CardAlreadyExistsError
              | UserOrWalletNotFoundOrNotActiveError
              | EmployeeHasNotAcceptedCguError
            >,
          ) => {
            expect(data.result).toBeFalsy()
            expect(data.error!.code).toBe(new CardAlreadyExistsError().code)
          },
        ),
      )
    try {
      const cardSaved =
        await services.cardRepo.findCurrentOneByEmployeeIdOrThrow(
          authInfo.user.id.value,
        )
      expect(cardSaved).toBeFalsy()
    } catch (e) {}

    const eventSaved = await (
      await testDataSource
    )
      .getRepository(EventOrmEntity)
      .createQueryBuilder()
      .where({ eventName: 'CardCreatedDomainEvent' })
      .andWhere('variables @> :variables', {
        variables: { employeeId: authInfo.user.id.value },
      })
      .getOne()
    expect(eventSaved).toBeFalsy()
  })

  afterAll(async () => {
    ;(await testDataSource).destroy()
    await app.close()
  })
})
