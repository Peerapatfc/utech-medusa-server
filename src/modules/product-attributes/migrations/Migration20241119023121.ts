import { Migration } from "@mikro-orm/migrations";

export class Migration20241119023121 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'alter table if exists "product_attribute" add column if not exists "use_in_product_variant" boolean not null default false;',
		);
	}

	async down(): Promise<void> {
		this.addSql(
			'alter table if exists "product_attribute" drop column if exists "use_in_product_variant";',
		);
	}
}
