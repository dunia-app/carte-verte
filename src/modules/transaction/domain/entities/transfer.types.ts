import { registerEnumType } from '@nestjs/graphql'

export enum TransferSource {
  MEAL_TICKET_CREDIT = 'MEAL_TICKET_CREDIT',
  MEAL_TICKET_EXPIRATION = 'MEAL_TICKET_EXPIRATION',
  CASHBACK = 'CASHBACK',
}
export const transferSourceEnumName = 'transfer_source_enum'

registerEnumType(TransferSource, { name: transferSourceEnumName })

export enum TransferDirection {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}
export const transferDirectionEnumName = 'transfer_direction_enum'

registerEnumType(TransferDirection, { name: transferDirectionEnumName })

export function getIconUrlTransferSource(source: TransferSource) {
  switch (source) {
    case TransferSource.MEAL_TICKET_CREDIT:
      return 'https://storage.googleapis.com/icons_ekip/ekip_credit.png'
    case TransferSource.MEAL_TICKET_EXPIRATION:
      return 'https://storage.googleapis.com/icons_ekip/ekip_expired.png'
    case TransferSource.CASHBACK:
      return 'https://storage.googleapis.com/icons_ekip/ekip_cashback.png'
  }
}
