import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePostEntities1740710126004 implements MigrationInterface {
    name = 'UpdatePostEntities1740710126004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" ADD "image" character varying`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "video" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "video"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "image"`);
    }

}
