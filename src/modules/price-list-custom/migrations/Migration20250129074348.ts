import { Migration } from '@mikro-orm/migrations';

export class Migration20250129074348 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table if not exists "price_list_custom" ("id" text not null, "rank" integer not null default 0, "is_flash_sale" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "price_list_custom_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_price_list_custom_deleted_at" ON "price_list_custom" (deleted_at) WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "price_list_custom" cascade;`);
	}
}
