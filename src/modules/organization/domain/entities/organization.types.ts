import { registerEnumType } from '@nestjs/graphql'

export enum OrganizationStatus {
  ORGANIZATION_ACTIVE = 'ORGANIZATION_ACTIVE',
  ORGANIZATION_NO_ADDRESS_OR_SIRET = 'ORGANIZATION_NO_ADDRESS_OR_SIRET',
  ORGANIZATION_OFFER_NOT_ACCEPTED = 'ORGANIZATION_OFFER_NOT_ACCEPTED',
}
export const organizationStatusEnumName = 'organization_status_enum'

registerEnumType(OrganizationStatus, {
  name: organizationStatusEnumName,
})
