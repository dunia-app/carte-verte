import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCardAcquisitionPaymentMethod1728905980915
  implements MigrationInterface
{
  name = 'AddCardAcquisitionPaymentMethod1728905980915'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_acquisition" ADD "paymentProduct" character varying NOT NULL DEFAULT 'mastercard'`,
    )
    await queryRunner.query(
      `ALTER TABLE "card_acquisition" ALTER COLUMN "paymentProduct" DROP DEFAULT`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "card_acquisition" DROP COLUMN "paymentProduct"`,
    )
  }
}
