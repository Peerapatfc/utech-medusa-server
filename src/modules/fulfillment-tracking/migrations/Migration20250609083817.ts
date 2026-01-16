import { Migration } from '@mikro-orm/migrations';

export class Migration20250609083817 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table if not exists "fulfillment_tracking" ("id" text not null, "current_status" text not null, "tracking_events" jsonb not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "fulfillment_tracking_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_fulfillment_tracking_deleted_at" ON "fulfillment_tracking" (deleted_at) WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "fulfillment_tracking" cascade;`);
	}
}
