import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUser1745747493415 implements MigrationInterface {
    name = 'CreateUser1745747493415'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "auth_id" character varying,
                "phone_number" character varying,
                "birth_date" TIMESTAMP,
                "gender" character varying,
                "profile_picture" character varying,
                "username" character varying NOT NULL,
                "email" character varying NOT NULL,
                "is_unsynced" boolean,
                "last_unsynced_at" TIMESTAMP,
                "enabled" boolean,
                "email_verified" boolean,
                "street" character varying,
                "city" character varying,
                "district" character varying,
                "country" character varying,
                "postal_code" character varying,
                CONSTRAINT "UQ_17d1817f241f10a3dbafb169fd2" UNIQUE ("phone_number"),
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "users"
        `);
    }

}
