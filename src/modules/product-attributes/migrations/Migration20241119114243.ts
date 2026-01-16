import { Migration } from "@mikro-orm/migrations";

export class Migration20241119114243 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'alter table if exists "product_attribute_option" add column if not exists "sub_title" text null, add column if not exists "description" text null;',
		);
	}

	async down(): Promise<void> {
		this.addSql(
			'alter table if exists "product_attribute_option" drop column if exists "sub_title";',
		);
		this.addSql(
			'alter table if exists "product_attribute_option" drop column if exists "description";',
		);
	}
}
