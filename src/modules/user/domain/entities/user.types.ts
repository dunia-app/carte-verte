export enum UserRoles {
  superAdmin = 'superAdmin',
  organizationAdmin = 'organizationAdmin',
  employee = 'employee',
  merchantAdmin = 'merchantAdmin',
}
export const userRolesEnumName = 'user_roles_enum'

export interface UpdateUserAddressProps {
  city?: string
  postalCode?: string
  street?: string
}
