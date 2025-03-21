import { registerEnumType } from '@nestjs/graphql'

export enum OrganizationAdminStatus {
  ORGANIZATION_ADMIN_ACTIVE = 'ORGANIZATION_ADMIN_ACTIVE ',
  ORGANIZATION_ADMIN_UNACTIVE = 'ORGANIZATION_ADMIN_UNACTIVE',
  ORGANIZATION_ADMIN_ACTIVE_RESET_CODE = 'ORGANIZATION_ADMIN_ACTIVE_RESET_CODE',
}
export const organizationAdminStatusEnumName = 'organization_admin_status_enum'

registerEnumType(OrganizationAdminStatus, {
  name: organizationAdminStatusEnumName,
})
