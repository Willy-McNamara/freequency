import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialEntityRefactor1707192203601 implements MigrationInterface {
    name = 'InitialEntityRefactor1707192203601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "gas_up" ("id" SERIAL NOT NULL, "musicianId" integer, "sessionId" integer, CONSTRAINT "PK_13b9acf71ae8a372985984e8526" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "text" character varying NOT NULL, "musicianId" integer, "sessionId" integer, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "musician" ("id" SERIAL NOT NULL, "googleId" character varying NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "profilePictureUrl" character varying, "totalSessions" integer NOT NULL, "totalPracticeMinutes" integer NOT NULL, "gasUps" integer NOT NULL, "longestStreak" integer NOT NULL, "currentStreak" integer NOT NULL, CONSTRAINT "PK_4882f033208324a695dd353f2ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "PK_6f8fc3d2111ccc30d98e173d8dd"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "sessionId"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "memberID"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "sessionTitle"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "sessionDuration"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "sessionNotes"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "sessionPublic"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "sessionTakeID"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "sessionDateTime"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "session" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD "notes" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD "duration" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD "isPublic" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD "takeId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD "date" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "session" ADD "musicianId" integer`);
        await queryRunner.query(`ALTER TABLE "gas_up" ADD CONSTRAINT "FK_0a4996bfc35531609463ee3dca7" FOREIGN KEY ("musicianId") REFERENCES "musician"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gas_up" ADD CONSTRAINT "FK_19af5483a18b84c97fb610bdde9" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_483fa17aa5c1fde706f181ba7ae" FOREIGN KEY ("musicianId") REFERENCES "musician"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_eec38fedfe97e9bb49279f50d67" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_d7638003dacdd24497743e3498e" FOREIGN KEY ("musicianId") REFERENCES "musician"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_d7638003dacdd24497743e3498e"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_eec38fedfe97e9bb49279f50d67"`);
        await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_483fa17aa5c1fde706f181ba7ae"`);
        await queryRunner.query(`ALTER TABLE "gas_up" DROP CONSTRAINT "FK_19af5483a18b84c97fb610bdde9"`);
        await queryRunner.query(`ALTER TABLE "gas_up" DROP CONSTRAINT "FK_0a4996bfc35531609463ee3dca7"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "musicianId"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "takeId"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "isPublic"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "duration"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11"`);
        await queryRunner.query(`ALTER TABLE "session" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "session" ADD "sessionDateTime" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD "sessionTakeID" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD "sessionPublic" boolean NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD "sessionNotes" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD "sessionDuration" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD "sessionTitle" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD "memberID" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD "sessionId" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "PK_6f8fc3d2111ccc30d98e173d8dd" PRIMARY KEY ("sessionId")`);
        await queryRunner.query(`DROP TABLE "musician"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "gas_up"`);
    }

}
