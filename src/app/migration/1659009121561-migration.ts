import {MigrationInterface, QueryRunner} from 'typeorm'

export class migration1659009121561 implements MigrationInterface {
  name = 'migration1659009121561'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "job" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "shortName" character varying(255) NOT NULL, "roleId" integer, CONSTRAINT "PK_98ab1c14ff8d1cf80d18703b92f" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "player" ("id" SERIAL NOT NULL, "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "nickName" character varying(255) NOT NULL, "jobId" integer NOT NULL, "partyId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "party" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "nickName" character varying(255) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3a2232993a18b306f966c1b8404" UNIQUE ("name"), CONSTRAINT "PK_e6189b3d533e140bb33a6d2cec1" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "job" ADD CONSTRAINT "FK_4ba0d6ac1cc2f9a8b02533b9afa" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "player" ADD CONSTRAINT "FK_b4a05377b7c03ea6c2acc4e7943" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "player" ADD CONSTRAINT "FK_88ed02f554cf56747d529fcb8a9" FOREIGN KEY ("partyId") REFERENCES "party"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_88ed02f554cf56747d529fcb8a9"`)
    await queryRunner.query(`ALTER TABLE "player" DROP CONSTRAINT "FK_b4a05377b7c03ea6c2acc4e7943"`)
    await queryRunner.query(`ALTER TABLE "job" DROP CONSTRAINT "FK_4ba0d6ac1cc2f9a8b02533b9afa"`)
    await queryRunner.query(`DROP TABLE "party"`)
    await queryRunner.query(`DROP TABLE "player"`)
    await queryRunner.query(`DROP TABLE "job"`)
    await queryRunner.query(`DROP TABLE "role"`)
  }
}
