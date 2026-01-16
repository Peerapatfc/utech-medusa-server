import { Migration } from '@mikro-orm/migrations';

export class Migration20250117031629 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table if exists "promotion_detail" add column if not exists "custom_rules" jsonb null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "promotion_detail" drop column if exists "custom_rules";');
  }

}
