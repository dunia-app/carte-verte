import { registerEnumType } from '@nestjs/graphql'

export enum EmployeeStatus {
  EMPLOYEE_ACTIVE_MEAL_TICKET = 'EMPLOYEE_ACTIVE_MEAL_TICKET',
  EMPLOYEE_ACTIVE = 'EMPLOYEE_ACTIVE',
  EMPLOYEE_NO_CARD_ACQUISITION = 'EMPLOYEE_NO_CARD_ACQUISITION',
  EMPLOYEE_UNACTIVE = 'EMPLOYEE_UNACTIVE',
  EMPLOYEE_NO_CGU = 'EMPLOYEE_NO_CGU',
  EMPLOYEE_ACTIVE_RESET_CODE = 'EMPLOYEE_ACTIVE_RESET_CODE',
  EMPLOYEE_ACTIVE_NEW_DEVICE = 'EMPLOYEE_ACTIVE_NEW_DEVICE',
}
export const employeeStatusEnumName = 'employee_status_enum'

registerEnumType(EmployeeStatus, { name: employeeStatusEnumName })
