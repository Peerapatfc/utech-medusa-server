import { Migration } from '@mikro-orm/migrations';

export class Migration20250401155110 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table if exists "store_notification" add column if not exists "created_by" text null;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table if exists "store_notification" drop column if exists "created_by";`,
		);
	}
}
