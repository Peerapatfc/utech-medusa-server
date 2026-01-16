import { Migration } from '@mikro-orm/migrations';

export class Migration20250401140112 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table if exists "price_list_custom" add column if not exists "is_notification_sent" boolean not null default false;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table if exists "price_list_custom" drop column if exists "is_notification_sent";`,
		);
	}
}
