import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddErrorType1724156381496 implements MigrationInterface {
  name = 'AddErrorType1724156381496'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."language_enum" AS ENUM('FR', 'EN')`,
    )
    await queryRunner.query(
      `CREATE TABLE "error_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "code" character varying NOT NULL, "language" "public"."language_enum" NOT NULL, "description" character varying, "translatedTitle" character varying, "translatedMessage" character varying, CONSTRAINT "PK_7fbf4fbeafa6eb50a6cf76f6291" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "error_type" ADD CONSTRAINT "UQ_error_type_code_language" UNIQUE ("code", "language")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "error_type" DROP CONSTRAINT "UQ_error_type_code_language"`,
    )
    await queryRunner.query(`DROP TABLE "error_type"`)
    await queryRunner.query(`DROP TYPE "public"."language_enum"`)
  }
}
