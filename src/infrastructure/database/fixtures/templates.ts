import { NotificationType } from '../../../modules/message/domain/entities/notification.types'
import { TemplateProps } from '../../../modules/message/domain/entities/template.entity'
import { MessageTemplateName } from '../../../modules/message/domain/entities/template.types'

/**
 * @module templates
 * This module exports an array of template properties.
 * Each object in the array represents a message template and includes the following properties:
 * - `templateName`: The name of the template.
 * - `allowedNotificationType`: An array of allowed notification types for this template.
 * - `content`: The content of the message template.
 * - `unsubscribable`: A boolean indicating whether the receiver can unsubscribe from this type of message.
 * @type {TemplateProps[]}
 */
export const templates: TemplateProps[] = [
  {
    templateName: MessageTemplateName.EMPLOYEE_ACCOUNT_CREATION_INVITATION,
    allowedNotificationType: [NotificationType.MAIL],
    content: '3906326',
    unsubscribable: false,
  },
  {
    templateName:
      MessageTemplateName.ORGANIZATION_ADMIN_ACCOUNT_CREATION_INVITATION,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4020420',
    unsubscribable: false,
  },
  {
    templateName:
      MessageTemplateName.NEW_ORGANIZATION_ADMIN_ACCOUNT_CREATION_INVITATION,
    allowedNotificationType: [NotificationType.MAIL],
    content: '6044312',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.ORGANIZATION_ADMIN_RESET_PASSWORD,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4418626',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_NEW_LOGIN_TOKEN,
    allowedNotificationType: [NotificationType.MAIL],
    content: '3910763',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.MEAL_TICKET_REMINDER_5D,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4182094',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.MEAL_TICKET_REMINDER_1D,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4182122',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.PAYMENT_VALIDATION_ACCEPTED,
    allowedNotificationType: [NotificationType.PUSH],
    content:
      "Votre dépense d'un montant de ':amount' chez ':merchantName' a été accepté.",
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.PAYMENT_VALIDATION_DECLINED,
    allowedNotificationType: [NotificationType.PUSH],
    content:
      "Votre dépense d'un montant de ':amount' chez ':merchantName' a été déclinée :textDeclinedReason.",
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.MEAL_TICKET_COMMAND_PAYED,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4420914',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.MEAL_TICKET_COMMAND_DISTRIBUTED,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4420944',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.MEAL_TICKET_COMMAND_VALIDATED,
    allowedNotificationType: [NotificationType.MAIL],
    content: '5743030',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.MEAL_TICKET_RECEIVED,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4420922',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.MEAL_TICKET_RECEIVED,
    allowedNotificationType: [NotificationType.PUSH],
    content:
      'Vous avez été crédité de :amountTotal€ pour vos Titres Restaurant du mois !',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_XPAY_SETUP,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4425528',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.NEW_MERCHANT_ALLOWED,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4453740',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.CASHBACK_RECEIVED,
    allowedNotificationType: [NotificationType.PUSH],
    content:
      'Vous avez gagné :amount€ de récompense responsable suite à votre achat chez :merchantName  ! 🎉',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_ACCOUNT_CREATION_REMINDER,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4627382',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_ACCOUNT_TUTORIAL,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4627943',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_ACCOUNT_TUTORIAL_NO_CASHBACK,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4884956',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_NO_TRANSACTION_REMINDER,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4628153',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.MEAL_TICKET_COMMAND_AWAITING_PAYMENT,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4627198',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_ASK_FOR_CASHBACK_MERCHANT,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4630885',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_PHYSICAL_CARD_CONVERTED,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4646695',
    unsubscribable: true,
  },
  {
    templateName:
      MessageTemplateName.MEAL_TICKET_COMMAND_AWAITING_PAYMENT_REMINDER,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4650853',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_NO_CASHBACK_REMINDER,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4656065',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_FIRST_CASHBACK,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4685636',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.MONTHLY_CASHBACK_RECEIVED,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4646598',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_NO_PAYMENT_METHOD,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4862181',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_NO_PAYMENT_METHOD_REMINDER,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4862524',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_SATISFACTION_WITH_ADVANTAGE,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4870705',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_SATISFACTION_NO_ADVANTAGE,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4884912',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_FIRST_PIN_REQUIRED,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4897757',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_FIRST_NOT_AVAILABLE_ON_SUNDAYS,
    allowedNotificationType: [NotificationType.MAIL],
    content: '5230930',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_FIRST_NOT_AVAILABLE_ON_UBER,
    allowedNotificationType: [NotificationType.MAIL],
    content: '5344941',
    unsubscribable: true,
  },
  {
    templateName: MessageTemplateName.CONFIRM_MANDATE,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4938031',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.CONFIRM_CASHBACK_MANDATE,
    allowedNotificationType: [NotificationType.MAIL],
    content: '6386724',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.MANDATE_REQUEST_BAD_IBAN,
    allowedNotificationType: [NotificationType.MAIL],
    content: '4958816',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_CARD_PIN_CHANGED,
    allowedNotificationType: [NotificationType.MAIL],
    content: '5034522',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.LAST_MONTH_MEAL_TICKET_REQUEST,
    allowedNotificationType: [NotificationType.MAIL],
    content: '5743030',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_WEEKLY_FORM,
    allowedNotificationType: [NotificationType.PUSH],
    content:
      "Nous vous invitons à remplir votre formulaire hebdomadaire. C'est par ici !",
    unsubscribable: false,
    link: 'carteverte://com.ekip.greencard/my-account/my-account-form',
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_FROZEN_ACCOUNT,
    allowedNotificationType: [NotificationType.PUSH],
    content:
      "Votre compte est gelé car nous n'avons pas réussi à prélever les fonds sur votre compte personnel. Veuillez nous informer lorsque les fonds seront à nouveau disponibles afin que l'on puisse vous débloquer.",
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.EMPLOYEE_UNFROZEN_ACCOUNT,
    allowedNotificationType: [NotificationType.PUSH],
    content:
      'Votre compte a été dégelé. Vous pouvez à nouveau utiliser Carte verte !',
    unsubscribable: false,
  },
  {
    templateName: MessageTemplateName.MAX_CASHBACK_REACHED,
    allowedNotificationType: [NotificationType.PUSH],
    title: 'Déjà 80EUR ! Plafond de remise atteint',
    content:
      'Vos remises seront de nouveau distribuées à partir du mois prochain.',
    unsubscribable: true,
  },
]
