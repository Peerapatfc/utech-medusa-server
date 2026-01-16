import { Migration } from '@mikro-orm/migrations';

export class Migration20250213041210 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table if exists "contact_us" add column if not exists "admin_read_status" text[] not null default '{}';`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_contact_us_deleted_at" ON "contact_us" (deleted_at) WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop index if exists "IDX_contact_us_deleted_at";`);
		this.addSql(
			`alter table if exists "contact_us" drop column if exists "admin_read_status";`,
		);
	}
}
