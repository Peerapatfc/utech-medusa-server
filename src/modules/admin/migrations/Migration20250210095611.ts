import { Migration } from '@mikro-orm/migrations';

export class Migration20250210095611 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table if not exists "inventory_item_logs" ("id" text not null, "action" text check ("action" in ('updated', 'reserved', 'returned')) not null, "from_quantity" integer not null default 0, "to_quantity" integer not null default 0, "inventory_item_id" text not null, "inventory_level_id" text null, "actor_id" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "inventory_item_logs_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_inventory_item_logs_deleted_at" ON "inventory_item_logs" (deleted_at) WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "inventory_item_logs" cascade;`);
	}
}
