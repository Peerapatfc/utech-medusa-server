import { Migration } from '@mikro-orm/migrations';

export class Migration20250203073107 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table if exists "price_list_custom" add column if not exists "products" jsonb null;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table if exists "price_list_custom" drop column if exists "products";`,
		);
	}
}
