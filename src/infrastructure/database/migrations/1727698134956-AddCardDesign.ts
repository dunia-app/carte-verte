import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCardDesign1727698134956 implements MigrationInterface {
  name = 'AddCardDesign1727698134956'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."card_design_enum" AS ENUM('BLUE', 'YELLOW', 'GREEN')`,
    )
    await queryRunner.query(
      `ALTER TABLE "card" ADD "design" "public"."card_design_enum" NOT NULL DEFAULT 'GREEN'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "card" DROP COLUMN "design"`)
    await queryRunner.query(`DROP TYPE "public"."card_design_enum"`)
  }
}
