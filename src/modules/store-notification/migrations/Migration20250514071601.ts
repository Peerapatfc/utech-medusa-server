import { Migration } from '@mikro-orm/migrations';

export class Migration20250514071601 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table if not exists "notification_subscription" ("id" text not null, "endpoint" text not null, "keys" jsonb not null, "expiration_time" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "notification_subscription_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_notification_subscription_deleted_at" ON "notification_subscription" (deleted_at) WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "notification_subscription" cascade;`);
	}
}
