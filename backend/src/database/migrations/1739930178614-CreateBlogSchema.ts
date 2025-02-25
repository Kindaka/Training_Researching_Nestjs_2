import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBlogSchema1739930178614 implements MigrationInterface {
    name = 'CreateBlogSchema1739930178614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e"`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_420d9f679d41281f282f5bc7d09" UNIQUE ("slug"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "slug" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b3aa10c29ea4e61a830362bd25a" UNIQUE ("slug"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comments" ("id" SERIAL NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "postId" integer, "parentId" integer, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_categories" ("postId" integer NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "PK_b8b835d4ca757299cd0d36804c0" PRIMARY KEY ("postId", "categoryId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d9837aecaf223e3cadb55fed67" ON "post_categories" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9bd6598aa52c1550ed7707a71b" ON "post_categories" ("categoryId") `);
        await queryRunner.query(`CREATE TABLE "post_tags" ("postId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "PK_ba869415ada9d211d8af980499f" PRIMARY KEY ("postId", "tagId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_76e701b89d9bba541e1543adfa" ON "post_tags" ("postId") `);
        await queryRunner.query(`CREATE INDEX "IDX_86fabcae8483f7cc4fbd36cf6a" ON "post_tags" ("tagId") `);
        await queryRunner.query(`ALTER TABLE "posts" ADD "slug" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "UQ_54ddf9075260407dcfdd7248577" UNIQUE ("slug")`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "published" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "viewCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "publishedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "content"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "content" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'MOD', 'USER')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER'`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_8770bd9030a3d13c5f79a7d2e81" FOREIGN KEY ("parentId") REFERENCES "comments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_d9837aecaf223e3cadb55fed677" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_9bd6598aa52c1550ed7707a71b9" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_tags" ADD CONSTRAINT "FK_76e701b89d9bba541e1543adfac" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_tags" ADD CONSTRAINT "FK_86fabcae8483f7cc4fbd36cf6a2" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_86fabcae8483f7cc4fbd36cf6a2"`);
        await queryRunner.query(`ALTER TABLE "post_tags" DROP CONSTRAINT "FK_76e701b89d9bba541e1543adfac"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_9bd6598aa52c1550ed7707a71b9"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_d9837aecaf223e3cadb55fed677"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_8770bd9030a3d13c5f79a7d2e81"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_e44ddaaa6d058cb4092f83ad61f"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_7e8d7c49f218ebb14314fdb3749"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role" character varying NOT NULL DEFAULT 'USER'`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "content"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "content" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "publishedAt"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "viewCount"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "published"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "UQ_54ddf9075260407dcfdd7248577"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "slug"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86fabcae8483f7cc4fbd36cf6a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_76e701b89d9bba541e1543adfa"`);
        await queryRunner.query(`DROP TABLE "post_tags"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9bd6598aa52c1550ed7707a71b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d9837aecaf223e3cadb55fed67"`);
        await queryRunner.query(`DROP TABLE "post_categories"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_c5a322ad12a7bf95460c958e80e" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
