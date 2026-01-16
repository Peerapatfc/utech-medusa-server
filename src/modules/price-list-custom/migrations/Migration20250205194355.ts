import { Migration } from '@mikro-orm/migrations';

export class Migration20250205194355 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table if not exists "price_list_variant" ("id" text not null, "product_variant_id" text not null, "quantity" integer not null default 0, "reserved_quantity" integer not null default 0, "price_list_custom_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "price_list_variant_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_price_list_variant_price_list_custom_id" ON "price_list_variant" (price_list_custom_id) WHERE deleted_at IS NULL;`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_price_list_variant_deleted_at" ON "price_list_variant" (deleted_at) WHERE deleted_at IS NULL;`,
		);

		this.addSql(
			`alter table if exists "price_list_variant" add constraint "price_list_variant_price_list_custom_id_foreign" foreign key ("price_list_custom_id") references "price_list_custom" ("id") on update cascade;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "price_list_variant" cascade;`);
	}
}
