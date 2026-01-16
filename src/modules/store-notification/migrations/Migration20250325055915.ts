import { Migration } from '@mikro-orm/migrations';

export class Migration20250325055915 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table if exists "store_notification" alter column "description" type text using ("description"::text);`,
		);
		this.addSql(
			`alter table if exists "store_notification" alter column "description" drop not null;`,
		);
		this.addSql(
			`alter table if exists "store_notification" alter column "image_url" type text using ("image_url"::text);`,
		);
		this.addSql(
			`alter table if exists "store_notification" alter column "image_url" drop not null;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table if exists "store_notification" alter column "description" type text using ("description"::text);`,
		);
		this.addSql(
			`alter table if exists "store_notification" alter column "description" set not null;`,
		);
		this.addSql(
			`alter table if exists "store_notification" alter column "image_url" type text using ("image_url"::text);`,
		);
		this.addSql(
			`alter table if exists "store_notification" alter column "image_url" set not null;`,
		);
	}
}
