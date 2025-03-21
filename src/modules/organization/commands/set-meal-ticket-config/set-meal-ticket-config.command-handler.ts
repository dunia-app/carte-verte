import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { OrganizationRepositoryPort } from '../../database/organization/organization.repository.port'
import {
  OrganizationCoveragePercentIsIncorrectError,
  OrganizationMealTicketAmountIsIncorrectError,
  OrganizationMealTicketDayIsIncorrectError,
} from '../../errors/organization.errors'
import { SetMealTicketConfigCommand } from './set-meal-ticket-config.command'

@CommandHandler(SetMealTicketConfigCommand)
export class SetMealTicketConfigCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: SetMealTicketConfigCommand,
  ): Promise<
    Result<
      string,
      | OrganizationMealTicketAmountIsIncorrectError
      | OrganizationCoveragePercentIsIncorrectError
      | OrganizationMealTicketDayIsIncorrectError
    >
  > {
    if (
      !command.coveragePercent &&
      !command.mealTicketAmount &&
      !command.mealTicketDay &&
      !command.mealTicketAutoRenew &&
      !command.physicalCardCoverage &&
      !command.firstPhysicalCardCoverage
    ) {
      return Result.ok(command.organizationId)
    }
    try {
      /* Use a repository provided by UnitOfWork to include everything 
       (including changes caused by Domain Events) into one 
       atomic database transaction */
      const organizationRepo: OrganizationRepositoryPort =
        this.unitOfWork.getOrganizationRepository(command.correlationId)

      const found = await organizationRepo.findOneByIdOrThrow(
        command.organizationId,
      )
      found.setSettings(
        command.coveragePercent,
        command.mealTicketAmount,
        command.mealTicketDay,
        command.mealTicketAutoRenew,
        command.physicalCardCoverage,
        command.firstPhysicalCardCoverage
      )

      const updated = await organizationRepo.save(found)
      return Result.ok(updated.id.value)
    } catch (e) {
      if (
        e instanceof OrganizationMealTicketAmountIsIncorrectError ||
        e instanceof OrganizationCoveragePercentIsIncorrectError ||
        e instanceof OrganizationMealTicketDayIsIncorrectError
      ) {
        return Result.err(e)
      } else {
        throw e
      }
    }
  }
}
