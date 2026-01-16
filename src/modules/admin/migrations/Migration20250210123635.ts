import { Migration } from '@mikro-orm/migrations';

export class Migration20250210123635 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table if exists "inventory_item_logs" alter column "from_quantity" type integer using ("from_quantity"::integer);`,
		);
		this.addSql(
			`alter table if exists "inventory_item_logs" alter column "from_quantity" drop not null;`,
		);
		this.addSql(
			`alter table if exists "inventory_item_logs" alter column "to_quantity" type integer using ("to_quantity"::integer);`,
		);
		this.addSql(
			`alter table if exists "inventory_item_logs" alter column "to_quantity" drop not null;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table if exists "inventory_item_logs" alter column "from_quantity" type integer using ("from_quantity"::integer);`,
		);
		this.addSql(
			`alter table if exists "inventory_item_logs" alter column "from_quantity" set not null;`,
		);
		this.addSql(
			`alter table if exists "inventory_item_logs" alter column "to_quantity" type integer using ("to_quantity"::integer);`,
		);
		this.addSql(
			`alter table if exists "inventory_item_logs" alter column "to_quantity" set not null;`,
		);
	}
}
