import { ArgsType, InputType } from '@nestjs/graphql'
import { SetOrganizationAdminPasswordRequest } from '../../commands/set-organization-admin-password/set-organization-admin-password.request.dto'

@ArgsType()
@InputType()
export class ValidateOrganizationAdminPasswordRequest extends SetOrganizationAdminPasswordRequest {}
