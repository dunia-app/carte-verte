import { MerchantOrganizationRepositoryPort } from "../../database/merchant-organization/merchant-organization.repository.port";
import { MerchantOrganizationEntity } from "../../domain/entities/merchant-organization.entity";
import { MatchMerchantOrganizationCommand } from "./match-merchant-organization.command";

export async function matchMerchantOrganization(
  command: MatchMerchantOrganizationCommand,
  merchantOrganizationRepo: MerchantOrganizationRepositoryPort,
  city_threshold : number = 0.4,
): Promise<MerchantOrganizationEntity[]> {
  return merchantOrganizationRepo.findManyByMerchantNameAndCityName(
    command.merchantName, 
    command.merchantCity, 
    city_threshold, 
  )
}