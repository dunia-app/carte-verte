import { NotImplementedException } from '@nestjs/common'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { TWithStringKeys } from '../../../../libs/types/t-with-keys'

/**
 * @module template.types
 * This module exports an enum `MessageTemplateName` that lists all the message templates names.
 */

/**
 * Enum for message template names.
 * @enum {string}
 */
export enum MessageTemplateName {
  PAYMENT_VALIDATION_DECLINED = 'PAYMENT_VALIDATION_DECLINED',
  PAYMENT_VALIDATION_ACCEPTED = 'PAYMENT_VALIDATION_ACCEPTED',
  EMPLOYEE_ACCOUNT_CREATION_INVITATION = 'EMPLOYEE_ACCOUNT_CREATION_INVITATION',
  EMPLOYEE_ACCOUNT_CREATION_REMINDER = 'EMPLOYEE_ACCOUNT_CREATION_REMINDER',
  EMPLOYEE_ACCOUNT_TUTORIAL = 'EMPLOYEE_ACCOUNT_TUTORIAL',
  EMPLOYEE_ACCOUNT_TUTORIAL_NO_CASHBACK = 'EMPLOYEE_ACCOUNT_TUTORIAL_NO_CASHBACK',
  EMPLOYEE_ASK_FOR_CASHBACK_MERCHANT = 'EMPLOYEE_ASK_FOR_CASHBACK_MERCHANT',
  EMPLOYEE_CARD_PIN_CHANGED = 'EMPLOYEE_CARD_PIN_CHANGED',
  EMPLOYEE_FIRST_CASHBACK = 'EMPLOYEE_FIRST_CASHBACK',
  EMPLOYEE_FIRST_PIN_REQUIRED = 'EMPLOYEE_FIRST_PIN_REQUIRED',
  EMPLOYEE_FIRST_NOT_AVAILABLE_ON_SUNDAYS = 'EMPLOYEE_FIRST_NOT_AVAILABLE_ON_SUNDAYS',
  EMPLOYEE_FIRST_NOT_AVAILABLE_ON_UBER = 'EMPLOYEE_FIRST_NOT_AVAILABLE_ON_UBER',
  EMPLOYEE_NEW_LOGIN_TOKEN = 'EMPLOYEE_NEW_LOGIN_TOKEN',
  EMPLOYEE_NO_TRANSACTION_REMINDER = 'EMPLOYEE_NO_TRANSACTION_REMINDER',
  EMPLOYEE_NO_PAYMENT_METHOD = 'EMPLOYEE_NO_PAYMENT_METHOD',
  EMPLOYEE_NO_PAYMENT_METHOD_REMINDER = 'EMPLOYEE_NO_PAYMENT_METHOD_REMINDER',
  EMPLOYEE_NO_CASHBACK_REMINDER = 'EMPLOYEE_NO_CASHBACK_REMINDER',
  EMPLOYEE_PHYSICAL_CARD_CONVERTED = 'EMPLOYEE_PHYSICAL_CARD_CONVERTED',
  EMPLOYEE_SATISFACTION_WITH_ADVANTAGE = 'EMPLOYEE_SATISFACTION_WITH_ADVANTAGE',
  EMPLOYEE_SATISFACTION_NO_ADVANTAGE = 'EMPLOYEE_SATISFACTION_NO_ADVANTAGE',
  EMPLOYEE_XPAY_SETUP = 'EMPLOYEE_XPAY_SETUP',
  ORGANIZATION_ADMIN_ACCOUNT_CREATION_INVITATION = 'ORGANIZATION_ADMIN_ACCOUNT_CREATION_INVITATION',
  NEW_ORGANIZATION_ADMIN_ACCOUNT_CREATION_INVITATION = 'NEW_ORGANIZATION_ADMIN_ACCOUNT_CREATION_INVITATION',
  ORGANIZATION_ADMIN_RESET_PASSWORD = 'ORGANIZATION_ADMIN_RESET_PASSWORD',
  MEAL_TICKET_REMINDER_5D = 'MEAL_TICKET_REMINDER_5D',
  MEAL_TICKET_REMINDER_1D = 'MEAL_TICKET_REMINDER_1D',
  MEAL_TICKET_COMMAND_AWAITING_PAYMENT = 'MEAL_TICKET_COMMAND_AWAITING_PAYMENT',
  MEAL_TICKET_COMMAND_AWAITING_PAYMENT_REMINDER = 'MEAL_TICKET_COMMAND_AWAITING_PAYMENT_REMINDER',
  MEAL_TICKET_COMMAND_PAYED = 'MEAL_TICKET_COMMAND_PAYED',
  MEAL_TICKET_COMMAND_DISTRIBUTED = 'MEAL_TICKET_COMMAND_DISTRIBUTED',
  MEAL_TICKET_COMMAND_VALIDATED = 'MEAL_TICKET_COMMAND_VALIDATED',
  MEAL_TICKET_RECEIVED = 'MEAL_TICKET_RECEIVED',
  CASHBACK_RECEIVED = 'CASHBACK_RECEIVED',
  MAX_CASHBACK_REACHED = 'MAX_CASHBACK_REACHED',
  MONTHLY_CASHBACK_RECEIVED = 'MONTHLY_CASHBACK_RECEIVED',
  NEW_MERCHANT_ALLOWED = 'NEW_MERCHANT_ALLOWED',
  CONFIRM_MANDATE = 'CONFIRM_MANDATE',
  CONFIRM_CASHBACK_MANDATE = 'CONFIRM_CASHBACK_MANDATE',
  MANDATE_REQUEST_BAD_IBAN = 'MANDATE_REQUEST_BAD_IBAN',
  LAST_MONTH_MEAL_TICKET_REQUEST = 'LAST_MONTH_MEAL_TICKET_REQUEST',
  EMPLOYEE_WEEKLY_FORM = 'EMPLOYEE_WEEKLY_FORM',
  EMPLOYEE_FROZEN_ACCOUNT = 'EMPLOYEE_FROZEN_ACCOUNT',
  EMPLOYEE_UNFROZEN_ACCOUNT = 'EMPLOYEE_UNFROZEN_ACCOUNT',
}

/**
 * Name of the message template name enum.
 */
export const messageTemplateNameEnumName = 'message_template_name_enum'

/**
 * Converts a message template name to a dashboard URL.
 *
 * @param messageTemplateName - The message template name.
 * @param variables - The variables to use in the URL.
 * @param config - The configuration service.
 * @returns - The dashboard URL.
 * @throws - If the message template name is not supported.
 */
export function templateNameToDashboardUrl(
  messageTemplateName: MessageTemplateName,
  variables: TWithStringKeys,
  config: ConfigService,
) {
  switch (messageTemplateName) {
    case MessageTemplateName.ORGANIZATION_ADMIN_ACCOUNT_CREATION_INVITATION:
    case MessageTemplateName.NEW_ORGANIZATION_ADMIN_ACCOUNT_CREATION_INVITATION:
      return `${config.getStr('DASHBOARD_URL')}/register?token=${
        variables.token
      }&email=${encodeURIComponent(variables.email)}&organizationId=${
        variables.organizationId
      }`
    case MessageTemplateName.ORGANIZATION_ADMIN_RESET_PASSWORD:
      return `${config.getStr('DASHBOARD_URL')}/reset_password?token=${
        variables.token
      }&email=${encodeURIComponent(variables.email)}`
    default:
      throw new NotImplementedException()
  }
}

/**
 * Converts a message template name to an app URL.
 *
 * @param messageTemplateName - The message template name.
 * @param variables - The variables to use in the URL.
 * @returns - The app URL.
 * @throws - If the message template name is not supported.
 */
export function templateNameToAppUrl(
  messageTemplateName: MessageTemplateName,
  variables: TWithStringKeys,
) {
  switch (messageTemplateName) {
    case MessageTemplateName.EMPLOYEE_NEW_LOGIN_TOKEN:
      return `https://redirection.ekip.app/redirection?url=ekip://com.ekip.mobile/onboarding/token?token=${
        variables.token
      }%26email=${encodeURIComponent(variables.email)}`
    default:
      throw new NotImplementedException()
  }
}
