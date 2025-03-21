import { CacheTimes } from '../../../../helpers/cache.helper'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { RedisService } from '../../../../infrastructure/redis/redis.service'
import { CardAcquisitionServiceError } from '../../../../libs/ddd/domain/ports/card-acquisition-service.port'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { AdvantageType } from '../../../merchant/domain/entities/advantage.types'
import { WalletRepositoryPort } from '../../database/wallet/wallet.repository.port'
import { WalletEntity } from '../../domain/entities/wallet.entity'
import { RequestCardAcquisitionLinkResponse } from '../../dtos/card-acquisition.dto'
import { CardAcquisitionNoAuthorizedOverdraftError } from '../../errors/card-acquisition.errors'
import { WalletAlreadyExistsError } from '../../errors/wallet.errors'
import { RequestExternalCardAcquisitionLinkCommand } from './request-external-card-acquisition-link.command'

const defaultWalletName = 'My Wallet'

export interface CardAcquisitionCacheResponse {
  url: string
  employeeId: string
  orderId: string
}

export async function requestExternalCardAcquisitionLink(
  command: RequestExternalCardAcquisitionLinkCommand,
  unitOfWork: UnitOfWork,
  cardAcquisition: CardAcquisitionService,
  redis: RedisService,
): Promise<
  Result<
    RequestCardAcquisitionLinkResponse,
    | WalletAlreadyExistsError
    | CardAcquisitionServiceError
    | CardAcquisitionNoAuthorizedOverdraftError
  >
> {
  /* Use a repository provided by UnitOfWork to include everything 
     (including changes caused by Domain Events) into one 
     atomic database transaction */
  const walletRepo: WalletRepositoryPort = unitOfWork.getWalletRepository(
    command.correlationId,
  )

  const cardAcquisitionResponse = await redis.fetch(
    `card-acquisition:${command.externalEmployeeId}`,
    CacheTimes.OneHour * 3,
    async (): Promise<
      Result<CardAcquisitionCacheResponse, CardAcquisitionServiceError>
    > => {
      const cardAcquisitionResponse =
        await cardAcquisition.requestCardAcquisitionLink(
          command.externalEmployeeId,
        )

      if (cardAcquisitionResponse.isErr) {
        return Result.err(cardAcquisitionResponse.error)
      }
      return Result.ok({
        url: cardAcquisitionResponse.value.url,
        employeeId: command.employeeId,
        orderId: cardAcquisitionResponse.value.orderId,
      })
    },
  )

  // externalWalet uniqueness guard
  if (
    !(await walletRepo.findOneByEmployeeIdAndAdvantage(
      command.employeeId,
      AdvantageType.EXTERNAL,
    ))
  ) {
    const externalWalet = WalletEntity.create({
      employeeId: new UUID(command.employeeId),
      name: defaultWalletName,
      advantage: AdvantageType.EXTERNAL,
    })

    await walletRepo.save(externalWalet)
  }
  return cardAcquisitionResponse.isOk
    ? Result.ok({
        url: cardAcquisitionResponse.value.url,
        orderId: cardAcquisitionResponse.value.orderId,
      })
    : cardAcquisitionResponse
}
