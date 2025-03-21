import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { OrganizationAdminLoginResp } from '../../dtos/organization-admin.response.dto'
import { OrganizationAdminPasswordFormatNotCorrectError } from '../../errors/organization-admin.errors'
import {
  OrganizationAlreadyAcceptedOfferError,
  OrganizationAlreadyHasSiretError,
} from '../../errors/organization.errors'
import { AddressRequest } from './register-organization-admin.request.dto'

// Command is a plain object with properties
export class RegisterOrganizationAdminCommand extends Command<
  OrganizationAdminLoginResp,
  | OrganizationAdminPasswordFormatNotCorrectError
  | OrganizationAlreadyHasSiretError
  | OrganizationAlreadyAcceptedOfferError
> {
  constructor(props: CommandProps<RegisterOrganizationAdminCommand>) {
    super(props)
    this.siret = props.siret
    this.email = props.email
    this.password = props.password
    this.name = props.name
    this.address = props.address
    this.organizationId = props.organizationId
  }

  readonly siret: string

  readonly email: string

  readonly password: string

  readonly name?: string

  readonly address?: AddressRequest

  readonly organizationId: string
}
