import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { OrganizationRepositoryPort } from '../../database/organization/organization.repository.port'
import { OrganizationAlreadyAcceptedOfferError } from '../../errors/organization.errors'
import { AcceptOrganizationOfferCommand } from './accept-organization-offer.command'

@CommandHandler(AcceptOrganizationOfferCommand)
export class AcceptOrganizationOfferCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: AcceptOrganizationOfferCommand,
  ): Promise<Result<Boolean, OrganizationAlreadyAcceptedOfferError>> {
    /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
    const organizationRepo: OrganizationRepositoryPort =
      this.unitOfWork.getOrganizationRepository(command.correlationId)

    const organization = await organizationRepo.findOneByIdOrThrow(
      command.organizationId,
    )
    const res = organization.acceptOffer()
    if (res.isErr) {
      return Result.err(res.error)
    }

    await organizationRepo.save(organization)
    return Result.ok(true)
  }
}
