import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { ExternalValidationResponseCode } from '../../domain/entities/external-validation.types'

export interface ExternalValidationResponseProps {
  responseDate: Date
  responseCode: ExternalValidationResponseCode
  responseId: UUID
}
export class ExternalValidationResponse {
  constructor(props: ExternalValidationResponseProps) {
    this.response_date = props.responseDate.toISOString()
    this.response_code = props.responseCode
    this.response_id = props.responseId.value
  }
  response_date: string
  response_code: string
  response_id: string
}
