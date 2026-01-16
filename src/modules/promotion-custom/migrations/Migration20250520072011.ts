import { Migration } from '@mikro-orm/migrations';

export class Migration20250520072011 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table if exists "promotion_detail" add column if not exists "is_new_customer" boolean not null default false, add column if not exists "promotion_type" text not null default 'discount';`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table if exists "promotion_detail" drop column if exists "is_new_customer", drop column if exists "promotion_type";`,
		);
	}
}
