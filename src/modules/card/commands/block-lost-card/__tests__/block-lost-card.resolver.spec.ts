import { INestApplication } from '@nestjs/common'
import { Baas } from '../../../../../infrastructure/baas/baas'
import { RedisService } from '../../../../../infrastructure/redis/redis.service'
import { EventOrmEntity } from '../../../../../libs/ddd/domain/domain-events/entities/event.orm-entity'
import { mockBaas } from '../../../../../libs/ddd/domain/ports/baas.port.mock'
import { DateVO } from '../../../../../libs/ddd/domain/value-objects/date.value-object'
import { ResolverResponseClass } from '../../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { onboardAsEmployee } from '../../../../../tests/auth_users'
import { expectEqualResult } from '../../../../../tests/helpers/requests_helpers'
import { testDataSource } from '../../../../../tests/test_data_source'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../../tests/test_utils'
import { WalletModule } from '../../../../wallet/wallet.module'
import { CardModule } from '../../../card.module'
import { CardRepository } from '../../../database/card/card.repository'
import { LockStatus } from '../../../domain/entities/card.types'
import { CardAlreadyBlockedError } from '../../../errors/card.errors'
import { buildBlockLostCardRequests } from './block-lost-card.request'

describe('BlockLostCard (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    cardRepo: CardRepository,
    baas: Baas,
  })

  let requests: ReturnType<typeof buildBlockLostCardRequests>
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
    requests = buildBlockLostCardRequests(app)
    mockBaas(services.baas)
  })

  it('Should block the card as lost', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    await requests
      .blockLostCard()
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<LockStatus, CardAlreadyBlockedError>,
          ) => {
            expect(data.result).toBe(LockStatus.LOST)
            expect(data.error).toBeFalsy()
          },
        ),
      )

    const [cardSaved, eventSaved] = await Promise.all([
      services.cardRepo.findOneByIdOrThrow(card.id.value),
      (
        await testDataSource
      )
        .getRepository(EventOrmEntity)
        .createQueryBuilder()
        .where({ eventName: 'LostCardBlockedDomainEvent' })
        .andWhere('variables @> :variables', {
          variables: { aggregateId: card.id.value },
        })
        .getOne(),
    ])
    expect(cardSaved.lockStatus).toBe(LockStatus.LOST)
    expect(eventSaved).toBeTruthy()
  })

  it('Should not block the card as lost as it is already blocked', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      undefined,
      { lockStatus: LockStatus.STOLEN, blockedAt: new DateVO(new Date()) },
    )

    await requests
      .blockLostCard()
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<LockStatus, CardAlreadyBlockedError>,
          ) => {
            expect(data.result).toBeFalsy()
            expect(data.error!.code).toBe(new CardAlreadyBlockedError().code)
          },
        ),
      )

    const [cardSaved, eventSaved] = await Promise.all([
      services.cardRepo.findOneByIdOrThrow(card.id.value),
      (
        await testDataSource
      )
        .getRepository(EventOrmEntity)
        .createQueryBuilder()
        .where({ eventName: 'LostCardBlockedDomainEvent' })
        .andWhere('variables @> :variables', {
          variables: { aggregateId: card.id.value },
        })
        .getOne(),
    ])
    expect(cardSaved.lockStatus).toBe(LockStatus.STOLEN)
    expect(eventSaved).toBeFalsy()
  })

  afterAll(async () => {
    ;(await testDataSource).destroy()
    await app.close()
  })
})
