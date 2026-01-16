import { Migration } from '@mikro-orm/migrations';

export class Migration20241120092049 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table if exists "pre_order_item_pickup_option" alter column "name_en" type text using ("name_en"::text);');
    this.addSql('alter table if exists "pre_order_item_pickup_option" alter column "name_en" drop not null;');
    this.addSql('alter table if exists "pre_order_item_pickup_option" drop column if exists "pre_order_unit_price";');
    this.addSql('alter table if exists "pre_order_item_pickup_option" drop column if exists "pre_order_raw_unit_price";');
    this.addSql('alter table if exists "pre_order_item_pickup_option" drop column if exists "raw_pre_order_unit_price";');
    this.addSql('alter table if exists "pre_order_item_pickup_option" drop column if exists "raw_pre_order_raw_unit_price";');

    this.addSql('alter table if exists "pre_order_template" add column if not exists "upfront_price" numeric not null default 0, add column if not exists "shipping_start_date" timestamptz null, add column if not exists "pickup_start_date" timestamptz null, add column if not exists "raw_upfront_price" jsonb not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "pre_order_item_pickup_option" add column if not exists "pre_order_unit_price" numeric not null default 0, add column if not exists "pre_order_raw_unit_price" numeric not null default 0, add column if not exists "raw_pre_order_unit_price" jsonb not null, add column if not exists "raw_pre_order_raw_unit_price" jsonb not null;');
    this.addSql('alter table if exists "pre_order_item_pickup_option" alter column "name_en" type text using ("name_en"::text);');
    this.addSql('alter table if exists "pre_order_item_pickup_option" alter column "name_en" set not null;');

    this.addSql('alter table if exists "pre_order_template" drop column if exists "upfront_price";');
    this.addSql('alter table if exists "pre_order_template" drop column if exists "shipping_start_date";');
    this.addSql('alter table if exists "pre_order_template" drop column if exists "pickup_start_date";');
    this.addSql('alter table if exists "pre_order_template" drop column if exists "raw_upfront_price";');
  }

}
