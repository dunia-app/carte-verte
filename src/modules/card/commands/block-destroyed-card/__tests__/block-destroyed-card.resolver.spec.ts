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
import { CardModule } from '../../../../card/card.module'
import { CardRepository } from '../../../../card/database/card/card.repository'
import { LockStatus } from '../../../../card/domain/entities/card.types'
import { WalletModule } from '../../../../wallet/wallet.module'
import { CardAlreadyBlockedError } from '../../../errors/card.errors'
import { buildBlockDestroyedCardRequests } from './block-destroyed-card.request'

describe('BlockDestroyedCard (Resolver)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    cardRepo: CardRepository,
    baas: Baas,
  })

  let requests: ReturnType<typeof buildBlockDestroyedCardRequests>
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
    requests = buildBlockDestroyedCardRequests(app)
    mockBaas(services.baas)
  })

  it('Should block the card as destroyed', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    await requests
      .blockDestroyedCard()
      .set(authInfo.headers)
      .expect(
        expectEqualResult(
          (
            data: ResolverResponseClass<LockStatus, CardAlreadyBlockedError>,
          ) => {
            expect(data.result).toBe(LockStatus.DESTROYED)
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
        .where({ eventName: 'DestroyedCardBlockedDomainEvent' })
        .andWhere('variables @> :variables', {
          variables: { aggregateId: card.id.value },
        })
        .getOne(),
    ])
    expect(cardSaved.lockStatus).toBe(LockStatus.DESTROYED)
    expect(eventSaved).toBeTruthy()
  })

  it('Should not block the card as destroyed as it is already blocked', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(
      app,
      undefined,
      undefined,
      { lockStatus: LockStatus.STOLEN, blockedAt: new DateVO(new Date()) },
    )

    await requests
      .blockDestroyedCard()
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
        .where({ eventName: 'DestroyedCardBlockedDomainEvent' })
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
