import { Migration } from '@mikro-orm/migrations';

export class Migration20250115043720 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "promotion_detail" ("id" text not null, "is_store_visible" boolean not null default true, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "promotion_detail_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_promotion_detail_deleted_at" ON "promotion_detail" (deleted_at) WHERE deleted_at IS NULL;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "promotion_detail" cascade;');
  }

}
