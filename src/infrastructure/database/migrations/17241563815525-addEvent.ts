import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEvent17241563815525 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "event" ("id" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "eventName" character varying NOT NULL, "variables" jsonb NOT NULL, CONSTRAINT "PK_3e9888411f62082be12e16ed545" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "event"`)
  }
}
