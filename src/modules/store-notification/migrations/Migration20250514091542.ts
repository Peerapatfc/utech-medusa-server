import { Migration } from '@mikro-orm/migrations';

export class Migration20250514091542 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table if exists "notification_subscription" alter column "expiration_time" type integer using ("expiration_time"::integer);`,
		);
		this.addSql(
			`alter table if exists "notification_subscription" alter column "expiration_time" drop not null;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table if exists "notification_subscription" alter column "expiration_time" type integer using ("expiration_time"::integer);`,
		);
		this.addSql(
			`alter table if exists "notification_subscription" alter column "expiration_time" set not null;`,
		);
	}
}
