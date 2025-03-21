import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameCardAcquisitionPayinTransactionId1728382352927
  implements MigrationInterface
{
  name = 'RenameCardAcquisitionPayinTransactionId1728382352927'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" RENAME COLUMN "transactionId" TO "transactionExternalPaymentId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "card" ALTER COLUMN "design" DROP DEFAULT`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notification_handledAt" ON notification ("sentAt", "failedToSendAt", "willSendAt")`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_transaction_createdAt" ON transaction ("createdAt")`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_transaction_employeeId" ON transaction ("employeeId")`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_transaction_externalPaymentId" ON transaction ("externalPaymentId")`,
    )
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_external_validation_createdAt" ON external_validation ("createdAt")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_notification_handledAt"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_transaction_createdAt"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_transaction_employeeId"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_transaction_externalPaymentId"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_external_validation_createdAt"`,
    )
    await queryRunner.query(
      `ALTER TABLE "card" ALTER COLUMN "design" SET DEFAULT 'GREEN'`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" RENAME COLUMN "transactionExternalPaymentId" TO "transactionId"`,
    )
  }
}
