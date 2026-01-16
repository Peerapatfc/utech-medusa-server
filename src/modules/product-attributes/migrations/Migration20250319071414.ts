import { Migration } from '@mikro-orm/migrations';

export class Migration20250319071414 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table if exists "product_attribute" add column if not exists "is_default" boolean not null default false;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table if exists "product_attribute" drop column if exists "is_default";`,
		);
	}
}
