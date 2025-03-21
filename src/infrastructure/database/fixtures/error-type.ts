import { Language } from '../../../helpers/language.helper'
import { OrmEntityProps } from '../../../libs/ddd/infrastructure/database/base-classes/orm-mapper.base'
import { ErrorTypeOrmEntity } from '../../../libs/exceptions/entities/error-type.orm-entity'

export const errorTypes: OrmEntityProps<ErrorTypeOrmEntity>[] = [
  {
    code: 'EMPLOYEE.NOT_FOUND',
    description: 'Un user renseigne un email inexistant',
    language: Language.FR,
    translatedTitle: 'Email non valide',
    translatedMessage:
      "Vérifiez la saisie. Regardez par exemple l'adresse email à laquelle vous avez reçu votre email Ekip.",
  },
  {
    code: 'TOKEN.EXPIRED',
    description: "ici c'est le token par mail (il faut en redemander un)",
    language: Language.FR,
    translatedTitle: 'Code Email erroné',
    translatedMessage:
      "Le code à 10 chiffres que vous avez renseigné n'est pas le bon. Assurez-vous bien qu'ils s'agissent du dernier email.",
  },
  {
    code: 'SMS.WRONG_CODE',
    description:
      'mauvais code pour valider son num (faut réessayer ou en redemander un)',
    language: Language.FR,
    translatedTitle: 'Code SMS erroné',
    translatedMessage:
      "Le code à 6 chiffres reçu par SMS n'est pas le bon. Assurez-vous bien qu'ils s'agissent du dernier code reçu.",
  },
  {
    code: 'MOBILE_TOKEN.NOT_FOUND',
    description:
      "ici c'est le token après avoir valider son numéro (il faut repartir sur cette page et redemander un sms)",
    language: Language.FR,
    translatedTitle: 'Votre numéro de téléphone est incorrect',
    translatedMessage: 'Renseignez un numéro de téléphone français svp.',
  },
  {
    code: 'EMPLOYEE.HAS_NOT_ACCEPTED_CGU',
    description:
      'il faut accepter les cgu avant toute opération (renvoi vers la page des cgu)',
    language: Language.FR,
    translatedTitle: 'Validez nos CGUs',
    translatedMessage:
      "Afin d'accéder à notre service, veuillez prendre connaissance et signer nos CGUs.",
  },
  {
    code: 'EMPLOYEE.CODE_FORMAT_NOT_CORRECT',
    description: ' mauvais format pour la création du code (réessayer)',
    language: Language.FR,
    translatedTitle: 'Code incorrect',
    translatedMessage:
      "Le format pour créer votre code n'est pas correct, Veuillez saisir à nouveau un code à 4 chiffres.",
  },
  {
    code: 'EMPLOYEE.WRONG_CODE_1',
    description: 'mauvais code pour se loger (réessayer)',
    language: Language.FR,
    translatedTitle: 'Code incorrect',
    translatedMessage: 'Tentative(s) restante(s) : 2',
  },
  {
    code: 'EMPLOYEE.WRONG_CODE_2',
    description: 'mauvais code pour se loger (réessayer)',
    language: Language.FR,
    translatedTitle: 'Code incorrect',
    translatedMessage: 'Tentative(s) restante(s) : 1',
  },
  {
    code: 'EMPLOYEE.CODE_TOO_MANY_FAILED_ATTEMPT',
    description:
      'trop de tentative de code (faut demander un reset de code, mail + setCode)',
    language: Language.FR,
    translatedTitle: 'Code incorrect',
    translatedMessage:
      'Vous avez dépassé le nombre de tentative possible. Vous allez recevoir un email pour vous reconnecter.',
  },
  {
    code: 'EMPLOYEE.FROZEN',
    description:
      "L'employee ne peut rien faire il a été bloqué par le super admin.",
    language: Language.FR,
    translatedTitle: 'Votre compte est bloqué',
    translatedMessage:
      "Nous reviendrons rapidement vers vous par email pour plus d'informations.",
  },
  {
    code: 'USER.ADDRESS_NOT_ACCEPTED_BY_BAAS',
    description: "treezor n'accepte pas l'adresse (réessayer)",
    language: Language.FR,
    translatedTitle: "Votre adresse n'a pas été acceptée",
    translatedMessage:
      'Veuillez renseigner une adresse en France, suffisamment précise pour pouvoir vous livrer la carte.',
  },
  {
    code: 'ORGANIZATION_ADMIN.NOT_FOUND',
    description: "Impossible de se loguer en tant qu'admin avec cet email",
    language: Language.FR,
    translatedTitle: '',
    translatedMessage: 'Identifiants de connexion invalides',
  },
  {
    code: 'ORGANIZATION_ADMIN_REQUEST.ALREADY_EXISTS',
    description: "Cet email a déjà demandé l'accès au dashboard",
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      'Vous avez déjà demandé un accès pour votre entreprise avec votre email.',
  },
  {
    code: 'ORGANIZATION_ADMIN.ALREADY_EXISTS',
    description: 'email existe déjà en base',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage: 'Cet administrateur existe déjà',
  },
  {
    code: 'ORGANIZATION_ADMIN.WRONG_PASSWORD',
    description: 'mauvais password pour se loger (réessayer)',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage: 'Mot de passe invalide',
  },
  {
    code: 'ORGANIZATION_ADMIN.EMAIL_NOT_FOUND',
    description: 'email pas trouvé (rééessayer)',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage: 'Adresse email non trouvée',
  },
  {
    code: 'ORGANIZATION_ADMIN.NOT_ACTIVATED',
    description:
      "impossible de changer son password ou de se login si on a pas fini l'onboarding (repartir sur l'onboarding)",
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      "Vous devez d'abord finaliser votre inscription pour accéder au dashboard.",
  },
  {
    code: 'ORGANIZATION_ADMIN.IS_LAST_ONE',
    description: 'impossible de supprimer le dernier admin',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage: 'Vous devez garder au moins un administrateur',
  },
  {
    code: 'ORGANIZATION_ADMIN.PASSWORD_TOO_MANY_FAILED_ATTEMPT',
    description: 'trop de tentative de password (reset password)',
    language: Language.FR,
    translatedTitle: 'Mot de passe incorrect',
    translatedMessage:
      'Vous avez dépassé le nombre de tentative possible. Vous allez recevoir un email pour vous reconnecter.',
  },
  {
    code: 'SIRET.NOT_FOUND',
    description: 'pas trouvé (rééessayer)',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage: 'Siret invalide',
  },
  {
    code: 'PLACE.NOT_FOUND',
    description: 'pas trouvé (rééessayer)',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage: 'Adresse non trouvée',
  },
  {
    code: 'EMPLOYEE.DOES_NOT_EXIST_IN_ORGANIZATION',
    description: 'employee pas trouvé pour créer une commande (réessayer)',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      'Aie, nous rencontrons actuellement des difficultés à exécuter cette action. Nous enregistrons ce bug pour le corriger au plus vite.',
  },
  {
    code: 'EMPLOYEE.ALREADY_EXISTS',
    description: 'employee existe déjà',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage: 'Ce collaborateur existe déjà',
  },
  {
    code: 'EMPLOYEE.EMAIL_DUPLICATED',
    description:
      'On essaie de créer 2 fois le même employés dans la même commande',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage: 'Ce collaborateur existe en double dans votre commande',
  },
  {
    code: 'EMPLOYEE.NAME_NOT_VALIDE',
    description:
      'Le nom est trop court ou trop long (entre 2 et 60 caractères demandés)',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      'Le nom de l’employé est invalide (entre 2 et 60 caractères demandés)',
  },
  {
    code: 'ORGANIZATION.NO_SETTINGS',
    description:
      'il faut paramétrer ses tickets restau avant de les distribuer',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      "Vous devez d'abord définir les modalités du titre restaurant.",
  },
  {
    code: 'ORGANIZATION.INCORRECT_MEAL_TICKET_AMOUNT',
    description:
      'valeur libératoire, en fonction du coveragePercent mais le max est défini par la loi',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      "La contribution actuelle de votre entreprise est supérieure à l'exonération autorisée (5.92€). Vous devez soit diminuer la valeur du titre ou bien diminuer la contribution employeur.",
  },
  {
    code: 'ORGANIZATION.INCORRECT_COVERAGE_PERCENT',
    description: 'entre 50 et 60 selon la loi',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      'La contribution employeur doit se situer entre 50 et 60%.',
  },
  {
    code: 'ORGANIZATION.INCORRECT_MEAL_TICKET_DAY',
    description:
      'entre 1 et 28 pour simplifier et que ça ait lieu tous les mois',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      'La date doit être comprise entre le 1er et le 28 du mois',
  },
  {
    code: 'MEAL_TICKET_COMMAND.ALREADY_EXISTS',
    description: "on ne peut créer qu'une commande par mois",
    language: Language.FR,
    translatedTitle: '',
    translatedMessage: 'Une commande est déjà en cours ce mois-ci',
  },
  {
    code: 'MEAL_TICKET_COMMAND.HAS_NO_TICKET',
    description: 'on en peut pas créer de commande vide',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage: 'Votre commande est vide',
  },
  {
    code: 'MEAL_TICKET_COMMAND_TEMPLATE.NOT_MATCHED',
    description:
      'On a pas réussi à trouver les champs obligatoires dans le fichier (nom, prénom, email, date de naissance et nb de TR)',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      "Votre fichier CSV n'est actuellement pas reconnu. Notre équipe technique est en train d'étudier son ajout.",
  },
  {
    code: 'MEAL_TICKET_COMMAND.WRONG_FILE_TYPE',
    description: '',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      'Le fichier que vous avez déposé ne semble pas être un fichier type CSV, seul fichier actuellement accepté.',
  },
  {
    code: 'MEAL_TICKET_COMMAND.HEADER_NOT_FOUND',
    description: '',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      'Le fichier que vous avez déposé ne semble pas contenir de header.',
  },
  {
    code: 'MEAL_TICKET_COMMAND.FILE_HAS_ERROR',
    description: '',
    language: Language.FR,
    translatedTitle: 'Fichier non valide',
    translatedMessage:
      'Votre fichier CSV n’est pas valide. Veuillez vérifier les informations et réessayer.',
  },
  {
    code: 'MEAL_TICKET_COMMAND_TEMPLATE.MISSING_INFO_EMAIL',
    description:
      "L'info n'est pas présente dans le fichier pour un des employés",
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      "Votre fichier CSV n'est actuellement pas reconnu. Notre équipe technique est en train d'étudier son ajout.",
  },
  {
    code: 'MEAL_TICKET_COMMAND_TEMPLATE.MISSING_INFO_FIRSTNAME',
    description:
      "L'info n'est pas présente dans le fichier pour un des employés",
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      "Votre fichier CSV n'est actuellement pas reconnu. Notre équipe technique est en train d'étudier son ajout.",
  },
  {
    code: 'MEAL_TICKET_COMMAND_TEMPLATE.MISSING_INFO_LASTNAME',
    description:
      "L'info n'est pas présente dans le fichier pour un des employés",
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      "Votre fichier CSV n'est actuellement pas reconnu. Notre équipe technique est en train d'étudier son ajout.",
  },
  {
    code: 'MEAL_TICKET_COMMAND_TEMPLATE.MISSING_INFO_BIRTHDAY',
    description:
      "L'info n'est pas présente dans le fichier pour un des employés",
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      "Votre fichier CSV n'est actuellement pas reconnu. Notre équipe technique est en train d'étudier son ajout.",
  },
  {
    code: 'MEAL_TICKET_COMMAND_TEMPLATE.MISSING_INFO_MEALTICKETCOUNT',
    description:
      "L'info n'est pas présente dans le fichier pour un des employés",
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      "Votre fichier CSV n'est actuellement pas reconnu. Notre équipe technique est en train d'étudier son ajout.",
  },
  {
    code: 'ORGANIZATION_ADMIN_REQUEST.HAS_NO_OFFER',
    description: "Pas d'offre pour cette demande d'accès au dashboard",
    language: Language.FR,
    translatedTitle: '',
    translatedMessage:
      "Vous n'avez pas encore d'offre proposé. Notre équipe technique est en train de l'ajouter.",
  },
  {
    code: 'EMPLOYEE.NEW_DEVICE_NOT_VALIDATED',
    description: 'Nouvel appareil inconnu et non validé',
    language: Language.FR,
    translatedTitle: 'Appareil inconnu',
    translatedMessage:
      "Votre nouvel appareil n'a pas été validé correctement. Merci de réessayer en vérifiant que vous avez la dernière mise à jour de l'application.",
  },
  {
    code: 'EMAIL.NOT_VALIDE',
    description: 'Email non valide',
    language: Language.FR,
    translatedTitle: '',
    translatedMessage: 'Email non valide',
  },
]
