import { Migration } from '@mikro-orm/migrations';

export class Migration20250206104837 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table if not exists "admin-log-requests" ("id" text not null, "path" text null, "method" text null, "query" jsonb null, "body" jsonb null, "actor_id" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "admin-log-requests_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_admin-log-requests_deleted_at" ON "admin-log-requests" (deleted_at) WHERE deleted_at IS NULL;`,
		);

		this.addSql(
			`alter table if exists "admin-logs" alter column "metadata" type jsonb using ("metadata"::jsonb);`,
		);
		this.addSql(
			`alter table if exists "admin-logs" alter column "metadata" drop not null;`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_admin-logs_deleted_at" ON "admin-logs" (deleted_at) WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "admin-log-requests" cascade;`);

		this.addSql(`drop index if exists "IDX_admin-logs_deleted_at";`);

		this.addSql(
			`alter table if exists "admin-logs" alter column "metadata" type jsonb using ("metadata"::jsonb);`,
		);
		this.addSql(
			`alter table if exists "admin-logs" alter column "metadata" set not null;`,
		);
	}
}
