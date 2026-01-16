import { Migration } from '@mikro-orm/migrations';

export class Migration20250303112201 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table if not exists "hook-logs" ("id" text not null, "path" text null, "name" text null, "method" text null, "query" jsonb null, "body" jsonb null, "actor_id" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "hook-logs_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_hook-logs_deleted_at" ON "hook-logs" (deleted_at) WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "hook-logs" cascade;`);
	}
}
