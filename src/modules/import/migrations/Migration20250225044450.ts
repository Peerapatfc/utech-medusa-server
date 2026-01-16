import { Migration } from '@mikro-orm/migrations';

export class Migration20250225044450 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table if not exists "import_histories" ("id" text not null, "import_type" text not null, "imported_file_id" text not null, "imported_file_url" text not null, "imported_result_file_id" text not null, "imported_result_file_url" text not null, "status" text check ("status" in ('success', 'failed')) not null default 'success', "errors" text null, "imported_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "import_histories_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_import_histories_deleted_at" ON "import_histories" (deleted_at) WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "import_histories" cascade;`);
	}
}
