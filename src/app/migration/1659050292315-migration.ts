import {MigrationInterface, QueryRunner} from 'typeorm'

export class migration1659050292315 implements MigrationInterface {
  name = 'migration1659050292315'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "position" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "PK_b7f483581562b4dc62ae1a5b7e2" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(`ALTER TABLE "public"."player" ADD "positionId" integer NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "public"."player" ADD CONSTRAINT "FK_6dd930212997b30c9d3f2a3f834" FOREIGN KEY ("positionId") REFERENCES "job"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."player" DROP CONSTRAINT "FK_6dd930212997b30c9d3f2a3f834"`)
    await queryRunner.query(`ALTER TABLE "public"."player" DROP COLUMN "positionId"`)
    await queryRunner.query(`DROP TABLE "position"`)
  }
}
