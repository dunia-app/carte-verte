import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  MerchantOrganizationEntity,
  MerchantOrganizationProps,
} from '../../domain/entities/merchant-organization.entity'

export interface FindManyToInviteResult {
  merchant: MerchantOrganizationEntity
  nbTransaction: number
}

export interface FindNewToInviteResult {
  merchant: MerchantOrganizationEntity
  daySince: number
}

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface MerchantOrganizationRepositoryPort
  extends RepositoryPort<
    MerchantOrganizationEntity,
    MerchantOrganizationProps
  > {
  findOneBySiret(siret: string): Promise<MerchantOrganizationEntity | undefined>
  findOneBySiretOrThrow(siret: string): Promise<MerchantOrganizationEntity>
  findOneBySiretOrSirenOrThrow(
    siret: string,
  ): Promise<MerchantOrganizationEntity>
  findOneBySiretOrSiren(
    siret: string,
  ): Promise<MerchantOrganizationEntity | undefined>
  findManyBySiret(siret: string[]): Promise<MerchantOrganizationEntity[]>
  exists(siret: string): Promise<boolean>
  blankUpdate(
    organizationIdsToBlankUpdate: string[],
  ): Promise<number | undefined>
  removeUnupdatedRegistration(): Promise<number | undefined>
  findManyByCityExact(city: string): Promise<MerchantOrganizationEntity[]>
  findManyByCity(city: string): Promise<MerchantOrganizationEntity[]>
  findManyActivatedByBatchNumber(
    batchSize: number,
    batchNumber: number,
  ): Promise<MerchantOrganizationEntity[]>
  findManyToInvite(
    nbOfTransaction: number[],
    batchSize: number,
  ): Promise<FindManyToInviteResult[]>
  findNewToInvite(
    nbOfTransaction: number[],
    batchSize: number,
  ): Promise<FindNewToInviteResult[]>
  findManyByMerchantNameAndCityName(
    merchantName: string,
    cityName: string,
    nameThreshold: number,
  ): Promise<MerchantOrganizationEntity[]>
}
