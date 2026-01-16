import { Migration } from '@mikro-orm/migrations';

export class Migration20241029100002 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table if exists "ms_city" alter column "id" type integer using ("id"::integer);');
    this.addSql('create sequence if not exists "ms_city_id_seq";');
    this.addSql('select setval(\'ms_city_id_seq\', (select max("id") from "ms_city"));');
    this.addSql('alter table if exists "ms_city" alter column "id" set default nextval(\'ms_city_id_seq\');');

    this.addSql('alter table if exists "ms_province" alter column "id" type integer using ("id"::integer);');
    this.addSql('create sequence if not exists "ms_province_id_seq";');
    this.addSql('select setval(\'ms_province_id_seq\', (select max("id") from "ms_province"));');
    this.addSql('alter table if exists "ms_province" alter column "id" set default nextval(\'ms_province_id_seq\');');

    this.addSql('alter table if exists "ms_sub_district" alter column "id" type integer using ("id"::integer);');
    this.addSql('create sequence if not exists "ms_sub_district_id_seq";');
    this.addSql('select setval(\'ms_sub_district_id_seq\', (select max("id") from "ms_sub_district"));');
    this.addSql('alter table if exists "ms_sub_district" alter column "id" set default nextval(\'ms_sub_district_id_seq\');');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "ms_city" alter column "id" type text using ("id"::text);');
    this.addSql('alter table if exists "ms_city" alter column "id" drop default;');

    this.addSql('alter table if exists "ms_province" alter column "id" type text using ("id"::text);');
    this.addSql('alter table if exists "ms_province" alter column "id" drop default;');

    this.addSql('alter table if exists "ms_sub_district" alter column "id" type text using ("id"::text);');
    this.addSql('alter table if exists "ms_sub_district" alter column "id" drop default;');
  }

}
