import { Migration } from '@mikro-orm/migrations';

export class Migration20241108062225 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "payment_restriction" ("id" text not null, "name" text not null, "is_active" boolean not null, "payment_providers" text[] not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payment_restriction_pkey" primary key ("id"));');

    this.addSql('create table if not exists "payment_restriction_rule" ("id" text not null, "description" text not null, "attribute" text not null, "operator" text not null, "payment_restriction_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payment_restriction_rule_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_payment_restriction_rule_payment_restriction_id" ON "payment_restriction_rule" (payment_restriction_id) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "payment_restriction_rule_value" ("id" text not null, "value" text not null, "payment_restriction_rule_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payment_restriction_rule_value_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_payment_restriction_rule_value_payment_restriction_rule_id" ON "payment_restriction_rule_value" (payment_restriction_rule_id) WHERE deleted_at IS NULL;');

    this.addSql('alter table if exists "payment_restriction_rule" add constraint "payment_restriction_rule_payment_restriction_id_foreign" foreign key ("payment_restriction_id") references "payment_restriction" ("id") on update cascade;');

    this.addSql('alter table if exists "payment_restriction_rule_value" add constraint "payment_restriction_rule_value_payment_restrictio_9c0ce_foreign" foreign key ("payment_restriction_rule_id") references "payment_restriction_rule" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "payment_restriction_rule" drop constraint if exists "payment_restriction_rule_payment_restriction_id_foreign";');

    this.addSql('alter table if exists "payment_restriction_rule_value" drop constraint if exists "payment_restriction_rule_value_payment_restrictio_9c0ce_foreign";');

    this.addSql('drop table if exists "payment_restriction" cascade;');

    this.addSql('drop table if exists "payment_restriction_rule" cascade;');

    this.addSql('drop table if exists "payment_restriction_rule_value" cascade;');
  }

}
