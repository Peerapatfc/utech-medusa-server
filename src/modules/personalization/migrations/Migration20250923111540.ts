import { Migration } from '@mikro-orm/migrations';

export class Migration20250923111540 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table if not exists "product_view" ("id" text not null, "product_id" text not null, "customer_id" text null, "guest_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_view_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_view_product_id" ON "product_view" (product_id) WHERE deleted_at IS NULL;`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_view_customer_id" ON "product_view" (customer_id) WHERE deleted_at IS NULL;`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_view_guest_id" ON "product_view" (guest_id) WHERE deleted_at IS NULL;`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_view_deleted_at" ON "product_view" (deleted_at) WHERE deleted_at IS NULL;`,
		);

		this.addSql(
			`create table if not exists "product_view_count" ("id" text not null, "product_id" text not null, "customer_id" text null, "guest_id" text null, "view_count" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_view_count_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_view_count_product_id" ON "product_view_count" (product_id) WHERE deleted_at IS NULL;`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_view_count_customer_id" ON "product_view_count" (customer_id) WHERE deleted_at IS NULL;`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_view_count_guest_id" ON "product_view_count" (guest_id) WHERE deleted_at IS NULL;`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_view_count_deleted_at" ON "product_view_count" (deleted_at) WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "product_view" cascade;`);

		this.addSql(`drop table if exists "product_view_count" cascade;`);
	}
}
