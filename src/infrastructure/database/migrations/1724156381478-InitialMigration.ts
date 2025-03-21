import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialMigration1724156381478 implements MigrationInterface {
  name = 'InitialMigration1724156381478'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "webhook" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "source" character varying NOT NULL, "externalId" character varying NOT NULL, "externalCreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "event" jsonb NOT NULL, "handledAt" TIMESTAMP WITH TIME ZONE, "handlerResponse" boolean, CONSTRAINT "UQ_webhook_source_external_id" UNIQUE ("source", "externalId"), CONSTRAINT "PK_e6765510c2d078db49632b59020" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."user_roles_enum" AS ENUM('superAdmin', 'organizationAdmin', 'employee', 'merchantAdmin')`,
    )
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "firstname" character varying NOT NULL, "lastname" character varying NOT NULL, "role" "public"."user_roles_enum" NOT NULL, "ipAdresses" text array NOT NULL DEFAULT '{}', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "organization_admin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "activatedAt" TIMESTAMP WITH TIME ZONE, "password" character varying, "refreshTokens" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_4020dcdbdc6830b903b1eee01a0" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."commission_type_enum" AS ENUM('PERCENT', 'PER_EMPLOYEE_PER_MONTH')`,
    )
    await queryRunner.query(
      `CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "city" character varying, "postalCode" character varying, "street" character varying, "longitude" double precision, "latitude" double precision, "siret" character varying, "hasAcceptedOffer" boolean NOT NULL, "commission" numeric NOT NULL, "commissionType" "public"."commission_type_enum" NOT NULL DEFAULT 'PERCENT', "advantageInShops" numeric NOT NULL, "physicalCardPrice" numeric NOT NULL, "firstPhysicalCardPrice" numeric NOT NULL, "coveragePercent" numeric, "mealTicketAmount" numeric, "mealTicketDay" smallint, "mealTicketAutoRenew" boolean DEFAULT false, "physicalCardCoverage" numeric DEFAULT '0', "firstPhysicalCardCoverage" numeric DEFAULT '0', "iban" character varying, "bankLabel" character varying, "commonName" character varying, CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "employee" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organizationId" uuid NOT NULL, "userId" uuid NOT NULL, "externalEmployeeId" character varying, "activatedAt" TIMESTAMP WITH TIME ZONE, "code" character varying, "refreshTokens" jsonb NOT NULL DEFAULT '[]', "mealTicketDays" jsonb, "cguAcceptedAt" TIMESTAMP WITH TIME ZONE, "codeFailedAttemps" smallint NOT NULL DEFAULT '0', "willBeDeletedAt" TIMESTAMP WITH TIME ZONE, "freezedAt" TIMESTAMP WITH TIME ZONE, "birthday" date NOT NULL, "deviceIds" text array NOT NULL DEFAULT '{}', CONSTRAINT "PK_3c2bc72f03fd5abbbc5ac169498" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."lock_status_enum" AS ENUM('UNLOCK', 'LOCK', 'LOST', 'STOLEN', 'DESTROYED')`,
    )
    await queryRunner.query(
      `CREATE TABLE "card" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "employeeId" uuid NOT NULL, "externalId" character varying NOT NULL, "publicToken" character varying NOT NULL, "lockStatus" "public"."lock_status_enum" NOT NULL, "activatedAt" TIMESTAMP WITH TIME ZONE, "requestedToConvertToPhysicalAt" TIMESTAMP WITH TIME ZONE, "convertedToPhysicalAt" TIMESTAMP WITH TIME ZONE, "physicalCardPriceToCover" numeric NOT NULL DEFAULT '0', "physicalCardCoveredAt" TIMESTAMP WITH TIME ZONE, "blockedAt" TIMESTAMP WITH TIME ZONE, "isPinSet" boolean NOT NULL DEFAULT false, "cardDigitalizations" jsonb NOT NULL DEFAULT '[]', "embossedName" character varying NOT NULL, "suffix" character varying NOT NULL, "pinTryExceeded" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."card_payment_status_enum" AS ENUM('IN_PROGRESS', 'COMPLETED', 'EXPIRED')`,
    )
    await queryRunner.query(
      `CREATE TABLE "card_payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "cardId" uuid NOT NULL, "externalPaymentId" character varying NOT NULL, "price" numeric NOT NULL, "status" "public"."card_payment_status_enum" NOT NULL, CONSTRAINT "PK_eb72ce815c9be16aeeef7ebc167" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."advantage_type_enum" AS ENUM('MEALTICKET', 'CULTURALCHEQUE', 'MOBILITYFORFAIT', 'GIFTCARD', 'NONE', 'EXTERNAL')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."advantage_period_enum" AS ENUM('DAILY', 'MONTHLY', 'YEARLY')`,
    )
    await queryRunner.query(
      `CREATE TABLE "advantage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying NOT NULL, "type" "public"."advantage_type_enum" NOT NULL, "index" integer NOT NULL, "legalLimit" numeric NOT NULL, "limitPeriod" "public"."advantage_period_enum" NOT NULL, "workingDaysOnly" boolean NOT NULL, CONSTRAINT "PK_7b3a018bf20774169ed749b920c" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "advantage_merchant_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "advantageId" uuid NOT NULL, "isBlackList" boolean NOT NULL DEFAULT true, "merchantCategoryId" uuid NOT NULL, CONSTRAINT "UQ_advantage_merchant_category" UNIQUE ("advantageId", "merchantCategoryId"), CONSTRAINT "PK_35eae7d790fe06bc0dd9a7555f2" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "merchant_label" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "link" character varying, "imageLink" text, CONSTRAINT "UQ_merchant_label_name" UNIQUE ("name"), CONSTRAINT "PK_224dd583c61344852f31f1a0e84" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_merchant_label_name" ON "merchant_label" ("name") `,
    )
    await queryRunner.query(
      `CREATE TABLE "merchant_category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "mcc" character varying NOT NULL, "name" character varying, "description" character varying, "iconUrl" character varying, "defaultImageLinks" text array NOT NULL DEFAULT '{}', "carbonFootprint" numeric, CONSTRAINT "UQ_merchant_category_mcc" UNIQUE ("mcc"), CONSTRAINT "PK_193eb59c92e574470923f86c469" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "merchant_category_naf" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "mcc" character varying NOT NULL, "naf" character varying NOT NULL, CONSTRAINT "UQ_merchant_category_naf_naf" UNIQUE ("naf"), CONSTRAINT "PK_4166b8e0106ef3cccc03600ea2d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_merchant_category_naf_naf" ON "merchant_category_naf" ("naf") `,
    )
    await queryRunner.query(
      `CREATE TABLE "merchant_organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "siret" character varying NOT NULL, "cntrRegistrationNumber" text, "naf" character varying NOT NULL, "brandName" character varying NOT NULL, "organizationName" character varying NOT NULL, "city" character varying, "postalCode" character varying, "street" character varying, "phone" character varying, "email" character varying, "registrationClosedAt" date, "registrationStartedAt" date, "organizationCreatedAt" date, "description" character varying, "website" character varying, "affiliationInvitationSent" smallint NOT NULL DEFAULT '0', "emailBouncedOn" TIMESTAMP, "imageLinks" text array NOT NULL DEFAULT '{}', "unactivatedAt" TIMESTAMP, CONSTRAINT "UQ_merchant_organization_siret" UNIQUE ("siret"), CONSTRAINT "UQ_merchant_organization_cntr_registration_number_siret" UNIQUE ("siret", "cntrRegistrationNumber"), CONSTRAINT "PK_ae95448193301d42ac3242c2b93" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_merchant_organization_naf" ON "merchant_organization" ("naf") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_merchant_organization_siret" ON "merchant_organization" ("siret") `,
    )
    await queryRunner.query(
      `CREATE TABLE "merchant_filter" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying NOT NULL, "name" character varying NOT NULL, "parentCode" "public"."advantage_type_enum" NOT NULL, CONSTRAINT "UQ_merchant_filter_code" UNIQUE ("code"), CONSTRAINT "PK_ab453e6d944bd30ddbf76858749" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "merchant_merchant_filter" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying NOT NULL, "mid" character varying NOT NULL, CONSTRAINT "UQ_merchant_merchant_filter_code_mid" UNIQUE ("code", "mid"), CONSTRAINT "PK_fe10d348b8e639cd14c377db9ba" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_merchant_merchant_filter_mid" ON "merchant_merchant_filter" ("mid") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_merchant_merchant_filter_code" ON "merchant_merchant_filter" ("code") `,
    )
    await queryRunner.query(
      `CREATE TABLE "merchant_admin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_52b6f4a374315ceafded22c7d0d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "receiver" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "email" character varying NOT NULL, "acceptEmail" boolean NOT NULL, "acceptNotification" boolean NOT NULL, "deviceTokens" jsonb NOT NULL DEFAULT '[]', "phoneNumber" character varying, CONSTRAINT "UQ_receiver_email" UNIQUE ("email"), CONSTRAINT "PK_c49c8583f3bebce9c6a3403ed30" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."advantage_form_enum" AS ENUM('CASHBACK', 'PROMO_CODE')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."point_of_sale_type_enum" AS ENUM('PHYSICAL', 'DELIVERY')`,
    )
    await queryRunner.query(
      `CREATE TABLE "merchant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "mid" character varying, "name" character varying NOT NULL, "merchantCategoryId" uuid, "advantageForm" "public"."advantage_form_enum", "pointOfSaleType" "public"."point_of_sale_type_enum", "description" character varying, "attribute" character varying, "phone" character varying, "city" character varying, "postalCode" character varying, "street" character varying, "country" character varying, "longitude" double precision, "latitude" double precision, "email" character varying, "website" character varying, "bio" double precision NOT NULL DEFAULT '0', "local" double precision NOT NULL DEFAULT '0', "vegetarian" double precision NOT NULL DEFAULT '0', "antiwaste" double precision NOT NULL DEFAULT '0', "nowaste" double precision NOT NULL DEFAULT '0', "inclusive" double precision NOT NULL DEFAULT '0', "total" double precision NOT NULL DEFAULT '0', "imageLinks" text array NOT NULL DEFAULT '{}', "deliveryCities" text array, "reviewLink" text, "labelName" character varying, "isHidden" boolean NOT NULL DEFAULT false, "isCashbackableSince" TIMESTAMP WITH TIME ZONE, "isBlacklisted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_9a3850e0537d869734fc9bff5d6" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_merchant_labelName" ON "merchant" ("labelName") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_merchant_mid" ON "merchant" ("mid") `,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."notification_type_enum" AS ENUM('IN_APP', 'PUSH', 'SMS', 'MAIL')`,
    )
    await queryRunner.query(
      `CREATE TABLE "template" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "templateName" character varying NOT NULL, "allowedNotificationType" "public"."notification_type_enum" array NOT NULL, "title" character varying, "content" character varying NOT NULL, "iconUrl" character varying, "link" character varying, "unsubscribable" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_fbae2ac36bd9b5e1e793b957b7f" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "message_template_name_enum" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "value" character varying NOT NULL, CONSTRAINT "UQ_message_template_name_enum" UNIQUE ("value"), CONSTRAINT "PK_c191d8698c18be348e36d949806" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "receiverId" uuid NOT NULL, "templateName" character varying NOT NULL, "variables" jsonb NOT NULL, "skipReceiverConsent" boolean NOT NULL DEFAULT false, "filesPaths" text array, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "messageId" uuid NOT NULL, "type" "public"."notification_type_enum" NOT NULL, "willSendAt" TIMESTAMP WITH TIME ZONE NOT NULL, "title" character varying, "content" character varying, "sentAt" TIMESTAMP WITH TIME ZONE, "failedToSendAt" TIMESTAMP WITH TIME ZONE, "receivedAt" TIMESTAMP WITH TIME ZONE, "response" jsonb, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "organization_admins_organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "adminId" uuid NOT NULL, "organizationId" uuid NOT NULL, CONSTRAINT "PK_5be86bdc87ae3f8e1022e1c8132" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "city" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying NOT NULL, "latitude" double precision NOT NULL, "longitude" double precision NOT NULL, CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "merchant_merchant_organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "mid" character varying NOT NULL, "merchantName" character varying NOT NULL, "siret" character varying NOT NULL, CONSTRAINT "UQ_merchant_merchant_organization_mid_siret" UNIQUE ("mid", "siret"), CONSTRAINT "UQ_merchant_merchant_organization_mid_merchant_name" UNIQUE ("mid", "merchantName"), CONSTRAINT "PK_99be7bf8a24b3877b098690ad64" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_merchant_merchant_organization_mid" ON "merchant_merchant_organization" ("mid") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_merchant_merchant_organization_siret" ON "merchant_merchant_organization" ("siret") `,
    )
    await queryRunner.query(
      `CREATE TABLE "super_admin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_3c4fab866f4c62a54ee1ebb1fe3" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "organization_wallet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organizationId" uuid NOT NULL, "name" character varying NOT NULL, "advantageList" jsonb NOT NULL, CONSTRAINT "UQ_e1ef4b7d3b48b8a990bc8ace954" UNIQUE ("organizationId"), CONSTRAINT "PK_1437a6c4896867bc247b7d297d7" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "card_acquisition" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "externalId" character varying NOT NULL, "employeeId" uuid NOT NULL, "token" character varying NOT NULL, "isActive" boolean NOT NULL, "maskedPan" character varying NOT NULL, CONSTRAINT "UQ_card_acquisition_external_id" UNIQUE ("externalId"), CONSTRAINT "PK_09ac5585e31f78a52c32af86110" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."external_validation_response_enum" AS ENUM('AUTHORIZED', 'DECLINED', 'DECLINED_INSUFFICIENT_FUNDS', 'DECLINED_LOCAL_CURRENCY_INVALID', 'DECLINED_DATETIME_INVALID', 'DECLINED_CARD_UNKNOW', 'DECLINED_MCC_INVALID', 'DECLINED_MERCHANTID_INVALID', 'DECLINED_MERCHANT_CITY_INVALID', 'DECLINED_MERCHANT_COUNTRY_INVALID')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_declined_reason_enum" AS ENUM('INSUFFICIENT_FUNDS', 'LIMIT_REACHED', 'NOT_AVAILABLE_ON_SUNDAYS', 'MERCHANT_INVALID', 'COUNTRY_INVALID', 'CARD_LOCKED', 'CVV_INCORRECT', 'EXP_DATE_INCORRECT', 'PIN_INCORRECT', 'PIN_REQUIRED', 'PIN_TRY_EXCEEDED')`,
    )
    await queryRunner.query(
      `CREATE TABLE "external_validation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "cardPublicToken" character varying NOT NULL, "paymentAmount" numeric NOT NULL, "paymentDate" TIMESTAMP WITH TIME ZONE NOT NULL, "mcc" character varying NOT NULL, "mid" character varying NOT NULL, "merchantName" character varying NOT NULL, "authorizationIssuerId" character varying NOT NULL, "cardId" uuid, "responseCode" "public"."external_validation_response_enum" NOT NULL, "declinedReason" "public"."transaction_declined_reason_enum", "siret" character varying, "msToAnswer" numeric, "triedMerchantMatching" boolean, CONSTRAINT "PK_7ceeea6854e41ecee91262ce191" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "wallet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "employeeId" uuid NOT NULL, "name" character varying NOT NULL, "balance" numeric NOT NULL, "authorizedBalance" numeric NOT NULL, "advantage" "public"."advantage_type_enum" NOT NULL, CONSTRAINT "UQ_wallet_employeeId_advantage" UNIQUE ("employeeId", "advantage"), CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."transfer_source_enum" AS ENUM('MEAL_TICKET_CREDIT', 'MEAL_TICKET_EXPIRATION', 'CASHBACK')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."transfer_direction_enum" AS ENUM('CREDIT', 'DEBIT')`,
    )
    await queryRunner.query(
      `CREATE TABLE "transfer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "walletId" uuid, "source" "public"."transfer_source_enum" NOT NULL, "name" character varying NOT NULL, "paymentDate" TIMESTAMP WITH TIME ZONE NOT NULL, "amount" numeric NOT NULL, "direction" "public"."transfer_direction_enum" NOT NULL, CONSTRAINT "PK_fd9ddbdd49a17afcbe014401295" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."transaction_status_enum" AS ENUM('Accepted', 'Refunded', 'Settled', 'Cleared', 'Declined', 'Reversed')`,
    )
    await queryRunner.query(
      `CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "cardId" uuid, "employeeId" uuid, "merchantId" character varying NOT NULL, "merchantName" character varying NOT NULL, "mcc" character varying NOT NULL, "cardPublicToken" character varying NOT NULL, "externalTransactionId" character varying NOT NULL, "externalPaymentId" character varying NOT NULL, "paymentDate" TIMESTAMP WITH TIME ZONE NOT NULL, "amount" numeric NOT NULL, "status" "public"."transaction_status_enum" NOT NULL, "authorizationNote" character varying, "authorizationResponseCode" character varying NOT NULL, "declinedReason" "public"."transaction_declined_reason_enum", "expiredAt" TIMESTAMP WITH TIME ZONE, "advantageRepartition" jsonb NOT NULL, "cashbackId" uuid, "authorizationIssuerId" character varying, "authorizationMti" character varying NOT NULL DEFAULT '100', CONSTRAINT "UQ_transaction_external_transaction_id" UNIQUE ("externalTransactionId"), CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."card_acquisition_payin_status_enum" AS ENUM('Authorized', 'Failed', 'Captured', 'Refunded', 'Pending')`,
    )
    await queryRunner.query(
      `CREATE TABLE "card_acquisition_payin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "externalId" character varying NOT NULL, "employeeId" uuid NOT NULL, "externalCardAcquisitionId" character varying, "amount" numeric NOT NULL, "status" "public"."card_acquisition_payin_status_enum" NOT NULL, "reference" character varying NOT NULL, "transactionId" character varying, "externalPayinId" character varying, "amountCaptured" numeric, CONSTRAINT "PK_52efbafdbcecb0dd80f48d9714a" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_e685aa0525450f3356fd618a92" ON "organization_admins_organizations" ("adminId") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_58830abec9099c1b01981ec8bb" ON "organization_admins_organizations" ("organizationId") `,
    )
    await queryRunner.query(
      `ALTER TABLE "organization_admin" ADD CONSTRAINT "FK_organization_admin_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "employee" ADD CONSTRAINT "FK_employee_organizationId" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "employee" ADD CONSTRAINT "FK_employee_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "card" ADD CONSTRAINT "FK_card_employeeId" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_payment" ADD CONSTRAINT "FK_card_payment_cardId" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "advantage_merchant_category" ADD CONSTRAINT "FK_advantage_merchant_category_advantageId" FOREIGN KEY ("advantageId") REFERENCES "advantage"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant_category_naf" ADD CONSTRAINT "FK_merchant_category_naf_mcc" FOREIGN KEY ("mcc") REFERENCES "merchant_category"("mcc") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant_merchant_filter" ADD CONSTRAINT "FK_merchant_merchant_filter_code" FOREIGN KEY ("code") REFERENCES "merchant_filter"("code") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant_admin" ADD CONSTRAINT "FK_merchant_admin_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "receiver" ADD CONSTRAINT "FK_receiver_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD CONSTRAINT "FK_merchant_merchantCategoryId" FOREIGN KEY ("merchantCategoryId") REFERENCES "merchant_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant" ADD CONSTRAINT "FK_merchant_labelName" FOREIGN KEY ("labelName") REFERENCES "merchant_label"("name") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "template" ADD CONSTRAINT "FK_template_templateName" FOREIGN KEY ("templateName") REFERENCES "message_template_name_enum"("value") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_message_receiverId" FOREIGN KEY ("receiverId") REFERENCES "receiver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_message_templateName" FOREIGN KEY ("templateName") REFERENCES "message_template_name_enum"("value") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" ADD CONSTRAINT "FK_notification_messageId" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "super_admin" ADD CONSTRAINT "FK_super_admin_userId" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition" ADD CONSTRAINT "FK_card_acquisition_employeeId" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "wallet" ADD CONSTRAINT "FK_wallet_employeeId" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "transfer" ADD CONSTRAINT "FK_transfer_walletId" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_transaction_cardId" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_transaction_employeeId" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_transaction_cashbackId" FOREIGN KEY ("cashbackId") REFERENCES "transfer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" ADD CONSTRAINT "FK_card_acquisition_payin_employeeId" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" ADD CONSTRAINT "FK_card_acquisition_payin_externalCardAcquisitionId" FOREIGN KEY ("externalCardAcquisitionId") REFERENCES "card_acquisition"("externalId") ON DELETE SET NULL ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "organization_admins_organizations" ADD CONSTRAINT "FK_organization_admins_organizations_adminId" FOREIGN KEY ("adminId") REFERENCES "organization_admin"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "organization_admins_organizations" ADD CONSTRAINT "FK_organization_admins_organizations_organizationId" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_admins_organizations" DROP CONSTRAINT "FK_organization_admin_userId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "organization_admins_organizations" DROP CONSTRAINT "FK_employee_organizationId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" DROP CONSTRAINT "FK_employee_userId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" DROP CONSTRAINT "FK_card_employeeId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_card_payment_cardId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_advantage_merchant_category_advantageId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_merchant_category_naf_mcc"`,
    )
    await queryRunner.query(
      `ALTER TABLE "transfer" DROP CONSTRAINT "FK_merchant_merchant_filter_code"`,
    )
    await queryRunner.query(
      `ALTER TABLE "wallet" DROP CONSTRAINT "FK_merchant_admin_userId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition" DROP CONSTRAINT "FK_receiver_userId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "super_admin" DROP CONSTRAINT "FK_merchant_merchantCategoryId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "notification" DROP CONSTRAINT "FK_merchant_labelName"`,
    )
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_template_templateName"`,
    )
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_message_receiverId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "template" DROP CONSTRAINT "FK_message_templateName"`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP CONSTRAINT "FK_notification_messageId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant" DROP CONSTRAINT "FK_super_admin_userId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "receiver" DROP CONSTRAINT "FK_card_acquisition_employeeId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant_admin" DROP CONSTRAINT "FK_wallet_employeeId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant_merchant_filter" DROP CONSTRAINT "FK_transfer_walletId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant_category_naf" DROP CONSTRAINT "FK_transaction_cardId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "advantage_merchant_category" DROP CONSTRAINT "FK_transaction_employeeId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_payment" DROP CONSTRAINT "FK_transaction_cashbackId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "card" DROP CONSTRAINT "FK_card_acquisition_payin_employeeId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "FK_card_acquisition_payin_externalCardAcquisitionId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "employee" DROP CONSTRAINT "FK_organization_admins_organizations_adminId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "organization_admin" DROP CONSTRAINT "FK_organization_admins_organizations_organizationId"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58830abec9099c1b01981ec8bb"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e685aa0525450f3356fd618a92"`,
    )
    await queryRunner.query(`DROP TABLE "card_acquisition_payin"`)
    await queryRunner.query(
      `DROP TYPE "public"."card_acquisition_payin_status_enum"`,
    )
    await queryRunner.query(`DROP TABLE "transaction"`)
    await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`)
    await queryRunner.query(`DROP TABLE "transfer"`)
    await queryRunner.query(`DROP TYPE "public"."transfer_direction_enum"`)
    await queryRunner.query(`DROP TYPE "public"."transfer_source_enum"`)
    await queryRunner.query(`DROP TABLE "wallet"`)
    await queryRunner.query(`DROP TABLE "external_validation"`)
    await queryRunner.query(
      `DROP TYPE "public"."transaction_declined_reason_enum"`,
    )
    await queryRunner.query(
      `DROP TYPE "public"."external_validation_response_enum"`,
    )
    await queryRunner.query(`DROP TABLE "card_acquisition"`)
    await queryRunner.query(`DROP TABLE "organization_wallet"`)
    await queryRunner.query(`DROP TABLE "super_admin"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_merchant_merchant_organization_siret"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_merchant_merchant_organization_mid"`,
    )
    await queryRunner.query(`DROP TABLE "merchant_merchant_organization"`)
    await queryRunner.query(`DROP TABLE "city"`)
    await queryRunner.query(`DROP TABLE "organization_admins_organizations"`)
    await queryRunner.query(`DROP TABLE "notification"`)
    await queryRunner.query(`DROP TABLE "message"`)
    await queryRunner.query(`DROP TABLE "message_template_name_enum"`)
    await queryRunner.query(`DROP TABLE "template"`)
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_merchant_mid"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_merchant_labelName"`)
    await queryRunner.query(`DROP TABLE "merchant"`)
    await queryRunner.query(`DROP TYPE "public"."point_of_sale_type_enum"`)
    await queryRunner.query(`DROP TYPE "public"."advantage_form_enum"`)
    await queryRunner.query(`DROP TABLE "receiver"`)
    await queryRunner.query(`DROP TABLE "merchant_admin"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_merchant_merchant_filter_code"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_merchant_merchant_filter_mid"`,
    )
    await queryRunner.query(`DROP TABLE "merchant_merchant_filter"`)
    await queryRunner.query(`DROP TABLE "merchant_filter"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_merchant_organization_siret"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_merchant_organization_naf"`,
    )
    await queryRunner.query(`DROP TABLE "merchant_organization"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_merchant_category_naf_naf"`,
    )
    await queryRunner.query(`DROP TABLE "merchant_category_naf"`)
    await queryRunner.query(`DROP TABLE "merchant_category"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_merchant_label_name"`)
    await queryRunner.query(`DROP TABLE "merchant_label"`)
    await queryRunner.query(`DROP TABLE "advantage_merchant_category"`)
    await queryRunner.query(`DROP TABLE "advantage"`)
    await queryRunner.query(`DROP TYPE "public"."advantage_period_enum"`)
    await queryRunner.query(`DROP TYPE "public"."advantage_type_enum"`)
    await queryRunner.query(`DROP TABLE "card_payment"`)
    await queryRunner.query(`DROP TYPE "public"."card_payment_status_enum"`)
    await queryRunner.query(`DROP TABLE "card"`)
    await queryRunner.query(`DROP TYPE "public"."lock_status_enum"`)
    await queryRunner.query(`DROP TABLE "employee"`)
    await queryRunner.query(`DROP TABLE "organization"`)
    await queryRunner.query(`DROP TYPE "public"."commission_type_enum"`)
    await queryRunner.query(`DROP TABLE "organization_admin"`)
    await queryRunner.query(`DROP TABLE "user"`)
    await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`)
    await queryRunner.query(`DROP TABLE "webhook"`)
  }
}
