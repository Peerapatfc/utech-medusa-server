import { Migration } from '@mikro-orm/migrations';

export class Migration20241021084347 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "ms_city" ("id" text not null, "name_th" text not null, "name_en" text not null, "province_id" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ms_city_pkey" primary key ("id"));');

    this.addSql('create table if not exists "ms_province" ("id" text not null, "name_th" text not null, "name_en" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ms_province_pkey" primary key ("id"));');

    this.addSql('create table if not exists "ms_sub_district" ("id" text not null, "name_th" text not null, "name_en" text not null, "city_id" integer not null, "postal_code" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "ms_sub_district_pkey" primary key ("id"));');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "ms_city" cascade;');

    this.addSql('drop table if exists "ms_province" cascade;');

    this.addSql('drop table if exists "ms_sub_district" cascade;');
  }

}
