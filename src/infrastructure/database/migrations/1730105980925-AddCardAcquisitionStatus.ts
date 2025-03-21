import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCardAcquisitionStatus1730105980925
  implements MigrationInterface
{
  name = 'AddCardAcquisitionStatus1730105980925'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_acquisition" ADD "status" "public"."card_acquisition_payin_status_enum" NOT NULL DEFAULT 'Authorized'`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition" ALTER COLUMN "status" DROP DEFAULT`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_acquisition" DROP COLUMN "status"`,
    )
  }
}
