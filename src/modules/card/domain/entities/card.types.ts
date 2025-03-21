import { registerEnumType } from '@nestjs/graphql'

export enum LockStatus {
  UNLOCK = 'UNLOCK',
  LOCK = 'LOCK',
  LOST = 'LOST',
  STOLEN = 'STOLEN',
  DESTROYED = 'DESTROYED',
}
export const lockStatusEnumName = 'lock_status_enum'

registerEnumType(LockStatus, { name: lockStatusEnumName })

export enum XPayProvider {
  APPLE = 'APPLE',
  SAMSUNG = 'SAMSUNG',
  GOOGLE = 'GOOGLE',
}
export const xPayProviderEnumName = 'x_pay_provider_enum'

registerEnumType(XPayProvider, { name: xPayProviderEnumName })

export enum CardDesign {
  BLUE = 'BLUE',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN',
}
export const cardDesignEnumName = 'card_design_enum'

registerEnumType(CardDesign, { name: cardDesignEnumName })
