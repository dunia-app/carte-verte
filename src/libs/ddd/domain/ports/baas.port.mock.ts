import { fakerFR as faker } from '@faker-js/faker'
import { Baas } from '../../../../infrastructure/baas/baas'
import { Result } from '../utils/result.util'

export function mockBaas(baas: Baas) {
  jest.spyOn(baas, 'createVirtualCard').mockResolvedValue(
    Result.ok({
      externalCardId: faker.string.numeric(5),
      publicToken: faker.string.numeric(9),
      embossedName: faker.person.firstName().toUpperCase(),
      suffix: faker.string.numeric(4)
    }),
  )
  jest.spyOn(baas, 'requestPhysicalCard').mockResolvedValue(Result.ok(true))
  jest.spyOn(baas, 'setPin').mockResolvedValue(Result.ok(true))
  jest.spyOn(baas, 'changePin').mockResolvedValue(Result.ok(true))
  jest.spyOn(baas, 'unlockPin').mockResolvedValue(Result.ok(true))
  jest.spyOn(baas, 'updateCardDailyLimit').mockResolvedValue(Result.ok(true))
  jest.spyOn(baas, 'updateCardLifetimeLimit').mockResolvedValue(Result.ok(true))
  jest.spyOn(baas, 'lockCard').mockResolvedValue(Result.ok(true))
  jest.spyOn(baas, 'unlockCard').mockResolvedValue(Result.ok(true))
  jest.spyOn(baas, 'blockLostCard').mockResolvedValue(Result.ok(true))
  jest.spyOn(baas, 'blockStolenCard').mockResolvedValue(Result.ok(true))
  jest.spyOn(baas, 'blockDestroyedCard').mockResolvedValue(Result.ok(true))
  jest
    .spyOn(baas, 'createUser')
    .mockResolvedValue(Result.ok(faker.string.numeric(5)))
  jest.spyOn(baas, 'deleteUser').mockResolvedValue(Result.ok(true))
  jest.spyOn(baas, 'updateEmployeeAddress').mockResolvedValue(Result.ok(true))
  jest.spyOn(baas, 'getWalletBalance').mockResolvedValue(1)
  jest.spyOn(baas, 'emulateCardTransaction').mockResolvedValue(Result.ok(true))
  jest
    .spyOn(baas, 'requestXPayCredential')
    .mockResolvedValue(Result.ok(faker.string.alphanumeric(15)))
}