import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDefaultAuthorizedOverdraft1728657302466
  implements MigrationInterface
{
  name = 'AddDefaultAuthorizedOverdraft1728657302466'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" ADD "defaultAuthorizedOverdraft" double precision NOT NULL DEFAULT 100`,
    )
    await queryRunner.query(
      `ALTER TABLE "employee" ALTER COLUMN "defaultAuthorizedOverdraft" DROP DEFAULT`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee" DROP COLUMN "defaultAuthorizedOverdraft"`,
    )
  }
}
