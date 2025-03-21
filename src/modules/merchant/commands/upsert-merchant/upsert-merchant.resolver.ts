import { CommandBus } from '@nestjs/cqrs'
import { Args, ObjectType, Resolver } from '@nestjs/graphql'
import { Email } from '../../../../libs/ddd/domain/value-objects/email.value-object'
import { ErrorWithResponse } from '../../../../libs/ddd/interface-adapters/base-classes/error-response.base'
import { AppMutation } from '../../../../libs/decorators/graphql.decorator'
import { UserRoles } from '../../../user/domain/entities/user.types'
import { MCC } from '../../domain/value-objects/mcc.value-object'
import { MccNotFoundError } from '../../errors/merchant.errors'
import { UpsertMerchantCommand } from './upsert-merchant.command'
import { UpsertMerchantRequest } from './upsert-merchant.request.dto'

@ObjectType()
class UpsertMerchantResponse extends ErrorWithResponse(
  [MccNotFoundError],
  'UpsertMerchantErrorUnion',
  String,
) {}

@Resolver()
export class UpsertMerchantGraphqlResolver {
  constructor(private readonly commandBus: CommandBus) {}

  @AppMutation(() => UpsertMerchantResponse, UserRoles.superAdmin)
  async upsertMerchant(
    @Args('input') input: UpsertMerchantRequest,
  ): Promise<UpsertMerchantResponse> {
    const command = new UpsertMerchantCommand({
      merchantId: input.merchantId,
      mid: input.mid,
      name: input.name,
      mcc: input.mcc ? new MCC(input.mcc) : undefined,
      siret: input.siret,
      advantageForm: input.advantageForm,
      pointOfSaleType: input.pointOfSaleType,
      description: input.description,
      phone: input.phone,
      city: input.city,
      postalCode: input.postalCode,
      street: input.street,
      longitude: input.longitude,
      latitude: input.latitude,
      email: input.email ? new Email(input.email) : undefined,
      website: input.website,
      bio: input.bio,
      local: input.local,
      vegetarian: input.vegetarian,
      antiwaste: input.antiwaste,
      nowaste: input.nowaste,
      inclusive: input.inclusive,
      imageLinks: input.imageLinks,
      deliveryCities: input.deliveryCities,
      attribute: input.attribute,
      labelName: input.labelName,
      reviewLink: input.reviewLink,
      isHidden: input.isHidden,
      isBlacklisted: input.isBlacklisted,
      filterCodes: input.filterCodes,
    })

    const res = await this.commandBus.execute(command)

    return new UpsertMerchantResponse(res)
  }
}
