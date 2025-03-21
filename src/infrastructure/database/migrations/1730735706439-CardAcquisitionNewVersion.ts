import { MigrationInterface, QueryRunner } from 'typeorm'

export class CardAcquisitionNewVersion1730735706439
  implements MigrationInterface
{
  name = 'CardAcquisitionNewVersion1730735706439'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" RENAME COLUMN "externalId" TO "externalAuthorizationId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition" ADD "baasId" character varying NOT NULL DEFAULT 'not set'`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" ALTER COLUMN "externalAuthorizationId" DROP NOT NULL`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" ALTER COLUMN "externalAuthorizationId" SET NOT NULL`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition" DROP COLUMN "baasId"`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" RENAME COLUMN "externalAuthorizationId" TO "externalId"`,
    )
  }
}
