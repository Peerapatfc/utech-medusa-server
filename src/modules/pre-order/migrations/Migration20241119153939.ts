import { Migration } from '@mikro-orm/migrations';

export class Migration20241119153939 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table if exists "po_pickup_option" alter column "shipping_start_date" type timestamptz using ("shipping_start_date"::timestamptz);');
    this.addSql('alter table if exists "po_pickup_option" alter column "shipping_start_date" drop not null;');
    this.addSql('alter table if exists "po_pickup_option" alter column "pickup_start_date" type timestamptz using ("pickup_start_date"::timestamptz);');
    this.addSql('alter table if exists "po_pickup_option" alter column "pickup_start_date" drop not null;');

    this.addSql('alter table if exists "pre_order_item_pickup_option" alter column "shipping_start_date" type timestamptz using ("shipping_start_date"::timestamptz);');
    this.addSql('alter table if exists "pre_order_item_pickup_option" alter column "shipping_start_date" drop not null;');
    this.addSql('alter table if exists "pre_order_item_pickup_option" alter column "pickup_start_date" type timestamptz using ("pickup_start_date"::timestamptz);');
    this.addSql('alter table if exists "pre_order_item_pickup_option" alter column "pickup_start_date" drop not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "po_pickup_option" alter column "shipping_start_date" type timestamptz using ("shipping_start_date"::timestamptz);');
    this.addSql('alter table if exists "po_pickup_option" alter column "shipping_start_date" set not null;');
    this.addSql('alter table if exists "po_pickup_option" alter column "pickup_start_date" type timestamptz using ("pickup_start_date"::timestamptz);');
    this.addSql('alter table if exists "po_pickup_option" alter column "pickup_start_date" set not null;');

    this.addSql('alter table if exists "pre_order_item_pickup_option" alter column "shipping_start_date" type timestamptz using ("shipping_start_date"::timestamptz);');
    this.addSql('alter table if exists "pre_order_item_pickup_option" alter column "shipping_start_date" set not null;');
    this.addSql('alter table if exists "pre_order_item_pickup_option" alter column "pickup_start_date" type timestamptz using ("pickup_start_date"::timestamptz);');
    this.addSql('alter table if exists "pre_order_item_pickup_option" alter column "pickup_start_date" set not null;');
  }

}
