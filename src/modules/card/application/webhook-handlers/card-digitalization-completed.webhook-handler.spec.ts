import { fakerFR as faker } from '@faker-js/faker'
import { INestApplication } from '@nestjs/common'
import { BaasWebhookModule } from '../../../../infrastructure/baas/baas-webhook.module'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { EventOrmEntity } from '../../../../libs/ddd/domain/domain-events/entities/event.orm-entity'
import { CardDigitalizationCompletedWebhookPayload } from '../../../../libs/ddd/infrastructure/baas/treezor-webhook.entity'
import { TreezorCardDigitalizationProps } from '../../../../libs/ddd/infrastructure/baas/treezor.entity'
import { onboardAsEmployee } from '../../../../tests/auth_users'
import { testDataSource } from '../../../../tests/test_data_source'
import {
  buildTypedServices,
  createTestModule,
} from '../../../../tests/test_utils'
import { WalletModule } from '../../../wallet/wallet.module'
import { CardModule } from '../../card.module'
import { CardRepository } from '../../database/card/card.repository'
import { XPayProvider } from '../../domain/entities/card.types'
import { CardDigitalizationCompletedWebhookHandler } from './card-digitalization-completed.webhook-handler'

describe('CardDigitalizationCompleted (Webhook Handler)', () => {
  let app: INestApplication
  const services = buildTypedServices({
    redis: RedisService,
    cardRepo: CardRepository,
    handler: CardDigitalizationCompletedWebhookHandler,
  })

  const defaultCardDigitalizationCompletedWebhookPayload: Partial<TreezorCardDigitalizationProps> =
    {
      deviceType: 'UNDEFINED',
      deviceName: '',
      tokenRequestor: 'APPLE',
      activationCode: '123456',
      activationCodeExpiry: 'Dec 31 2016 11:11AM',
      activationMethod: 'EMAIL_TO_CARDHOLDER_ADDRESS',
      expirationDate: '2025-12-01',
    }

  beforeAll(async () => {
    app = await createTestModule(
      {
        imports: [WalletModule, CardModule, BaasWebhookModule],
      },
      services,
    )

    await app.init()
    await app.getHttpAdapter().getInstance().ready()
    await services.redis.flushCache()
  })

  it('Should update card XPayProvider and save event', async () => {
    const { authInfo, wallet, card } = await onboardAsEmployee(app)

    const cardDigitizationId = faker.string.numeric(5)

    const payload: CardDigitalizationCompletedWebhookPayload = {
      ...defaultCardDigitalizationCompletedWebhookPayload,
      cardId: Number(card.externalId),
    } as CardDigitalizationCompletedWebhookPayload

    const res = await services.handler.handle(cardDigitizationId, payload)

    expect(res).toBe(true)
    const [cardSaved, eventSaved] = await Promise.all([
      services.cardRepo.findOneByIdOrThrow(card.id.value),
      await (
        await testDataSource
      )
        .getRepository(EventOrmEntity)
        .createQueryBuilder()
        .where({ eventName: 'CardDigitalizedDomainEvent' })
        .andWhere('variables @> :variables', {
          variables: { aggregateId: card.id.value },
        })
        .getOne(),
    ])

    expect(cardSaved).toBeTruthy()
    expect(cardSaved.employeeId).toStrictEqual(authInfo.user.id)
    expect(cardSaved.providers[0]).toBe(XPayProvider.APPLE)

    expect(eventSaved).toBeTruthy()
    expect(eventSaved!.variables.provider).toBe(XPayProvider.APPLE)
    expect(eventSaved!.variables.cardDigitizationId).toBe(cardDigitizationId)
  })

  afterAll(async () => {
    ;(await testDataSource).destroy()
    await app.close()
  })
})
