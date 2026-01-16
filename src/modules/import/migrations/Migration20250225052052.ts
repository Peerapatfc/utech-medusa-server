import { Migration } from '@mikro-orm/migrations';

export class Migration20250225052052 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table if exists "import_histories" add column if not exists "original_filename" text not null;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table if exists "import_histories" drop column if exists "original_filename";`,
		);
	}
}
