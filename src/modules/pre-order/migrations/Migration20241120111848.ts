import { Migration } from '@mikro-orm/migrations';

export class Migration20241120111848 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table if exists "pre_order_item" drop column if exists "variant_id";');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "pre_order_item" add column if not exists "variant_id" text not null;');
  }

}
