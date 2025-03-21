import { QueryHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { QueryHandlerBase } from '../../../../libs/ddd/domain/base-classes/query-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { OrganizationRepository } from '../../../organization/database/organization/organization.repository'
import { CardRepository } from '../../database/card/card.repository'
import { CardResponse } from '../../dtos/card.response.dto'
import { CardNotFoundError } from '../../errors/card.errors'
import { FindCardQuery } from './find-card.query'

@QueryHandler(FindCardQuery)
export class FindCardQueryHandler extends QueryHandlerBase {
  constructor(
    private readonly cardRepo: CardRepository,
    private readonly organizationRepo: OrganizationRepository,
    private readonly baas: Baas,
  ) {
    super()
  }

  /* Since this is a simple query with no additional business
     logic involved, it bypasses application's core completely 
     and retrieves cards directly from a repository.
   */
  async handle(
    query: FindCardQuery,
  ): Promise<Result<CardResponse, CardNotFoundError>> {
    try {
      const card = await this.cardRepo.findCurrentOneByEmployeeIdOrThrow(
        query.employeeId,
      )

      const organization = query.organizationId
        ? await this.organizationRepo.findOneById(query.organizationId)
        : undefined

      const physicalCardsCount =
        await this.cardRepo.countPhysicalCardByEmployeeId(query.employeeId)
      const additionnalInfo =
        query.addIsPinLocked || (query.addMaskedPan && !card.embossedName)
          ? await this.baas.getCard(card.externalId)
          : undefined

      if (additionnalInfo && additionnalInfo.isErr) {
        return Result.err(new CardNotFoundError())
      }
      // To simplify until everyone has additionnal info in DB
      if (additionnalInfo && !card.embossedName) {
        card.embossedName = additionnalInfo.value.embossedName
        card.suffix = additionnalInfo.value.maskedPan.slice(-4)
        this.cardRepo.save(card)
      }
      const isPinLocked =
        additionnalInfo && additionnalInfo.isOk
          ? additionnalInfo.value.pinTryExceeds === 1
            ? true
            : false
          : undefined
      const embossedName =
        additionnalInfo && additionnalInfo.isOk
          ? additionnalInfo.value.embossedName
          : card.embossedName
      const maskedPan =
        additionnalInfo && additionnalInfo.isOk
          ? additionnalInfo.value.maskedPan.slice(-4)
          : card.suffix
      const physicalCardPrice = organization
        ? organization.getPhysicalCardPriceForEmployee(physicalCardsCount)
        : undefined

      return Result.ok(
        new CardResponse(
          card,
          maskedPan,
          embossedName,
          isPinLocked,
          physicalCardPrice,
        ),
      )
    } catch (e) {
      if (e instanceof NotFoundException) {
        return Result.err(new CardNotFoundError())
      }
      throw e
    }
  }
}
