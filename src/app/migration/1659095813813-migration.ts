import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1659095813813 implements MigrationInterface {
  name = 'migration1659095813813'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "party" DROP COLUMN "nickName"`);
    await queryRunner.query(`ALTER TABLE "party"
      ADD "spaceId" CHARACTER VARYING(255) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "party"
      ADD CONSTRAINT "UQ_29108b95173e79ac68d792488ed" UNIQUE ("spaceId")`);
    await queryRunner.query(`ALTER TABLE "party" DROP CONSTRAINT "UQ_3a2232993a18b306f966c1b8404"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "party"
      ADD CONSTRAINT "UQ_3a2232993a18b306f966c1b8404" UNIQUE ("name")`);
    await queryRunner.query(`ALTER TABLE "party" DROP CONSTRAINT "UQ_29108b95173e79ac68d792488ed"`);
    await queryRunner.query(`ALTER TABLE "party" DROP COLUMN "spaceId"`);
    await queryRunner.query(`ALTER TABLE "party"
      ADD "nickName" CHARACTER VARYING(255) NOT NULL`);
  }

}
