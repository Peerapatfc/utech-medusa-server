import { Migration } from '@mikro-orm/migrations';

export class Migration20250116042253 extends Migration {
	async up(): Promise<void> {
		this.addSql(
			'alter table if exists "promotion_detail" add column "name" text null;',
		);
		this.addSql(
			'alter table if exists "promotion_detail" add column "description" text null;',
		);
	}

	async down(): Promise<void> {
		this.addSql('alter table if exists "promotion_detail" drop column "name";');
		this.addSql(
			'alter table if exists "promotion_detail" drop column "description";',
		);
	}
}
