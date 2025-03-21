import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintMerchantNameAndMidMerchantMerchantOrganizationOrmEntity1729254538925
  implements MigrationInterface
{
  name =
    'AddUniqueConstraintMerchantNameAndMidMerchantMerchantOrganizationOrmEntity1729254538925'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_merchant_organization" ADD CONSTRAINT "UQ_merchant_merchant_organization_mid_name" UNIQUE ("mid", "merchantName")`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant_merchant_organization" DROP CONSTRAINT "UQ_merchant_merchant_organization_mid_siret_name"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merchant_merchant_organization" DROP CONSTRAINT "UQ_merchant_merchant_organization_mid_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "merchant_merchant_organization" ADD CONSTRAINT "UQ_merchant_merchant_organization_mid_siret_name" UNIQUE ("mid", "siret", "merchantName")`,
    );
  }
}
