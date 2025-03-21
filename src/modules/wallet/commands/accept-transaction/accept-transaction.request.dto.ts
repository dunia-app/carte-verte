import { IsUUID } from 'class-validator'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'

export class ExternalValidationPayload {
  // We need to set one validator at least
  // so that class validator is not undefined for this object
  @IsUUID()
  request_id!: UUID
  card_public_token!: string
  request_date!: string
  payment_amount!: {
    value: number
    value_smallest_unit: number
    currency_code: string
  }
  payment_local_amount!: {
    value: number
    value_smallest_unit: number
    currency_code: string
  }
  payment_local_time!: string
  authorization_issuer_id!: string
  merchant_data!: {
    id: string
    name: string
    city: string
    country_code: string
    mcc: string
    acquirer_id: string
  }
}
