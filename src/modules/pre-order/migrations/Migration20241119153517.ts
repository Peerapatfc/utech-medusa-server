import { Migration } from '@mikro-orm/migrations';

export class Migration20241119153517 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "po_pickup_option" ("id" text not null, "name_th" text not null, "name_en" text not null, "slug" text not null, "is_upfront_payment" boolean not null default false, "is_overide_unit_price" boolean not null default false, "is_enabled_shipping" boolean not null default true, "upfront_price" numeric not null default 0, "shipping_start_date" timestamptz not null default null, "pickup_start_date" timestamptz not null default null, "rank" integer not null default 0, "raw_upfront_price" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "po_pickup_option_pkey" primary key ("id"));');
    this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_po_pickup_option_slug_unique" ON "po_pickup_option" (slug) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "pre_order_item" ("id" text not null, "product_id" text not null, "variant_id" text not null, "pre_order_template_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pre_order_item_pkey" primary key ("id"));');

    this.addSql('create table if not exists "pre_order_item_pickup_option" ("id" text not null, "option_slug" text not null, "name_th" text not null, "name_en" text not null, "is_upfront_payment" boolean not null default false, "is_overide_unit_price" boolean not null default false, "is_enabled_shipping" boolean not null default true, "upfront_price" numeric not null default 0, "shipping_start_date" timestamptz not null default null, "pickup_start_date" timestamptz not null default null, "rank" integer not null default 0, "pre_order_unit_price" numeric not null default 0, "pre_order_raw_unit_price" numeric not null default 0, "pre_order_item_id" text not null, "raw_upfront_price" jsonb not null, "raw_pre_order_unit_price" jsonb not null, "raw_pre_order_raw_unit_price" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pre_order_item_pickup_option_pkey" primary key ("id"));');

    this.addSql('create table if not exists "pre_order_template" ("id" text not null, "name_th" text not null, "name_en" text null, "created_by" text null, "metadata" jsonb not null default \'{}\', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "pre_order_template_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "po_pickup_option" cascade;');

    this.addSql('drop table if exists "pre_order_item" cascade;');

    this.addSql('drop table if exists "pre_order_item_pickup_option" cascade;');

    this.addSql('drop table if exists "pre_order_template" cascade;');
  }

}
