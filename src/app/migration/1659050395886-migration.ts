import {MigrationInterface, QueryRunner} from 'typeorm'

export class migration1659050395886 implements MigrationInterface {
  name = 'migration1659050395886'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."player" DROP CONSTRAINT "FK_6dd930212997b30c9d3f2a3f834"`)
    await queryRunner.query(
      `ALTER TABLE "public"."player" ADD CONSTRAINT "FK_6dd930212997b30c9d3f2a3f834" FOREIGN KEY ("positionId") REFERENCES "position"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."player" DROP CONSTRAINT "FK_6dd930212997b30c9d3f2a3f834"`)
    await queryRunner.query(
      `ALTER TABLE "public"."player" ADD CONSTRAINT "FK_6dd930212997b30c9d3f2a3f834" FOREIGN KEY ("positionId") REFERENCES "job"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }
}
