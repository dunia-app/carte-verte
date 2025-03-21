import { CommandBus } from '@nestjs/cqrs'
import { ObjectType, Resolver } from '@nestjs/graphql'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { CardAcquisitionRepository } from '../../database/card-acquisition/card-acquisition.repository'
import { CreateBaasAcquisitionsCommand } from './create-baas-acquisitions.command'

@ObjectType()
class CreateBaasAcquisitionsResponse extends ErrorWithResponse(
  [],
  'CreateBaasAcquisitionsErrorUnion',
  Number,
) {}

@Resolver()
export class CreateBaasAcquisitionsResolver {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly cardAcquisitionRepo: CardAcquisitionRepository,
  ) {}

  @AppMutation(() => CreateBaasAcquisitionsResponse, UserRoles.superAdmin)
  async createBaasAcquisitions(): Promise<CreateBaasAcquisitionsResponse> {
    const cardAcquisitions =
      await this.cardAcquisitionRepo.findManyWithoutBaasId()
    let updatedCount = 0

    for (const cardAcquisition of cardAcquisitions) {
      const command = new CreateBaasAcquisitionsCommand({
        cardAcquisition,
      })
      try {
        const result = await this.commandBus.execute(command)
        if (result) {
          updatedCount++
        }
      } catch (error) {
        // Handle the error appropriately
        console.error(
          `Failed to execute command for cardAcquisition: ${cardAcquisition.id}`,
          error,
        )
      }
    }

    return new CreateBaasAcquisitionsResponse(Result.ok(updatedCount))
  }
}
