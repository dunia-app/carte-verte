import { RepositoryPort } from '../../../../libs/ddd/domain/ports/repository.ports'
import {
  MerchantMerchantOrganizationEntity,
  MerchantMerchantOrganizationProps,
} from '../../domain/entities/merchant-merchant-organization.entity'
import { AdvantageForm } from '../../domain/entities/merchant.types'

/* Repository port belongs to application's core, but since it usually
 changes together with repository it is kept in the same directory for
 convenience. */
export interface MerchantMerchantOrganizationRepositoryPort
  extends RepositoryPort<
    MerchantMerchantOrganizationEntity,
    MerchantMerchantOrganizationProps
  > {
  findOneByMid(
    mid: string,
  ): Promise<MerchantMerchantOrganizationEntity | undefined>
  findOneByMidOrThrow(mid: string): Promise<MerchantMerchantOrganizationEntity>
  findOneByMidAndMerchantName(
    mid: string,
    merchantName: string,
  ): Promise<MerchantMerchantOrganizationEntity | undefined>
  findOneBySiret(
    siret: string,
  ): Promise<MerchantMerchantOrganizationEntity | undefined>
  exists(mid: string, siret: string, merchantName: string): Promise<boolean>
  findManyByCreatedAt(
    createdSince: Date,
  ): Promise<MerchantMerchantOrganizationEntity[]>
  findManyByCreatedAtAndAdvantage(
    createdSince: Date,
    advantageForm: AdvantageForm,
  ): Promise<MerchantMerchantOrganizationEntity[]>
  findManyBySirets(
    sirets: string[],
  ): Promise<MerchantMerchantOrganizationEntity[]>
  findAllByMerchantName(
    merchantName: string,
  ): Promise<MerchantMerchantOrganizationEntity[]>
  updateMid(existingMid: string, mid: string): Promise<boolean>
  upsert(
    mid: string,
    merchantName: string,
    matchedSiret: string,
  ): Promise<boolean>
}
