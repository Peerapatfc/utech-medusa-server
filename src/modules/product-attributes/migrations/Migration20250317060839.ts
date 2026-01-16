import { Migration } from '@mikro-orm/migrations';

export class Migration20250317060839 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table if exists "product_attribute" drop constraint if exists "product_attribute_code_unique";`,
		);
		this.addSql(
			`create table if not exists "product_attribute" ("id" text not null, "title" text not null, "code" text not null, "description" text null, "is_filterable" boolean not null default false, "is_required" boolean not null default false, "is_unique" boolean not null default false, "rank" integer not null default 0, "metadata" jsonb null, "status" boolean not null default true, "type" text check ("type" in ('text', 'textarea', 'texteditor', 'date', 'datetime', 'boolean', 'multiselect', 'select', 'media_image', 'swatch_visual', 'swatch_text')) not null, "use_in_product_variant" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_attribute_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_attribute_code_unique" ON "product_attribute" (code) WHERE deleted_at IS NULL;`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_attribute_deleted_at" ON "product_attribute" (deleted_at) WHERE deleted_at IS NULL;`,
		);

		this.addSql(
			`create table if not exists "product_attribute_category" ("id" text not null, "name" text not null, "description" text null, "rank" integer not null default 0, "metadata" jsonb null, "status" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_attribute_category_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_attribute_category_deleted_at" ON "product_attribute_category" (deleted_at) WHERE deleted_at IS NULL;`,
		);

		this.addSql(
			`create table if not exists "product_attribute_option" ("id" text not null, "title" text not null, "sub_title" text null, "description" text null, "value" text not null, "rank" integer not null default 0, "metadata" jsonb null, "attribute_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_attribute_option_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_attribute_option_attribute_id" ON "product_attribute_option" (attribute_id) WHERE deleted_at IS NULL;`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_attribute_option_deleted_at" ON "product_attribute_option" (deleted_at) WHERE deleted_at IS NULL;`,
		);

		this.addSql(
			`create table if not exists "product_attribute_to_category" ("id" text not null, "attribute_id" text not null, "category_id" text not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_attribute_to_category_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_attribute_to_category_attribute_id" ON "product_attribute_to_category" (attribute_id) WHERE deleted_at IS NULL;`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_attribute_to_category_category_id" ON "product_attribute_to_category" (category_id) WHERE deleted_at IS NULL;`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_product_attribute_to_category_deleted_at" ON "product_attribute_to_category" (deleted_at) WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table if exists "product_attribute_option" drop constraint if exists "product_attribute_option_attribute_id_foreign";`,
		);

		this.addSql(`drop table if exists "product_attribute" cascade;`);

		this.addSql(`drop table if exists "product_attribute_category" cascade;`);

		this.addSql(`drop table if exists "product_attribute_option" cascade;`);

		this.addSql(
			`drop table if exists "product_attribute_to_category" cascade;`,
		);
	}
}
