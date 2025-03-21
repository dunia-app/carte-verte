import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPayinErrorCodeMessage1730735706469
  implements MigrationInterface
{
  name = 'AddPayinErrorCodeMessage1730735706469'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" ADD "errorCode" character varying`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" ADD "errorMessage" character varying`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" DROP COLUMN "errorMessage"`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition_payin" DROP COLUMN "errorCode"`,
    )
  }
}
