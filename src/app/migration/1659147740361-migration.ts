import {MigrationInterface, QueryRunner} from 'typeorm'

export class migration1659147740361 implements MigrationInterface {
  name = 'migration1659147740361'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player"
      ADD "ulid" CHARACTER VARYING(255) NOT NULL`)
    await queryRunner.query(`ALTER TABLE "player"
      ADD CONSTRAINT "UQ_7a80666a73fd2bbac3016735c67" UNIQUE ("ulid")`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "UQ_7a80666a73fd2bbac3016735c67"`)
    await queryRunner.query(`ALTER TABLE "player" DROP COLUMN "ulid"`)
  }
}
