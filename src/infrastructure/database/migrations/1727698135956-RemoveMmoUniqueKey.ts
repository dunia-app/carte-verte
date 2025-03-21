import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveMmoUniqueKey1727698135956 implements MigrationInterface {
  name = 'RemoveMmoUniqueKey1727698135956'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS public.merchant_merchant_organization DROP CONSTRAINT IF EXISTS "UQ_merchant_merchant_organization_mid_siret";`,
    )
    await queryRunner.query(
      `ALTER TABLE IF EXISTS public.merchant_merchant_organization DROP CONSTRAINT IF EXISTS "UQ_merchant_merchant_organization_mid_merchant_name";`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant_merchant_organization" ADD CONSTRAINT "UQ_merchant_merchant_organization_mid_siret_name" UNIQUE ("mid", "siret", "merchantName")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS public.merchant_merchant_organization DROP CONSTRAINT IF EXISTS "UQ_merchant_merchant_organization_mid_siret_name";`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant_merchant_organization" ADD CONSTRAINT "UQ_merchant_merchant_organization_mid_merchant_name" UNIQUE ("mid", "merchantName")`,
    )
    await queryRunner.query(
      `ALTER TABLE "merchant_merchant_organization" ADD CONSTRAINT "UQ_merchant_merchant_organization_mid_siret" UNIQUE ("mid", "siret")`,
    )
  }
}
