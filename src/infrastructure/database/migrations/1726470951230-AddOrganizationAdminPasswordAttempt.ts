import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOrganizationAdminPasswordAttempt1726470951230
  implements MigrationInterface
{
  name = 'AddOrganizationAdminPasswordAttempt1726470951230'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_admin" ADD "passwordFailedAttemps" smallint NOT NULL DEFAULT '0'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organization_admin" DROP COLUMN "passwordFailedAttemps"`,
    )
  }
}
