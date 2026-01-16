import { Migration } from '@mikro-orm/migrations';

export class Migration20250211102902 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table if not exists "product_pricing_logs" ("id" text not null, "previous_amount" integer null default 0, "new_amount" integer null default 0, "product_id" text not null, "variant_id" text null, "price_id" text null, "actor_id" text null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_pricing_logs_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_pricing_logs_deleted_at" ON "product_pricing_logs" (deleted_at) WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "product_pricing_logs" cascade;`);
	}
}
