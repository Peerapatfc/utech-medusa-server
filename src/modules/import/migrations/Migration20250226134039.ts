import { Migration } from '@mikro-orm/migrations';

export class Migration20250226134039 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`alter table if exists "import_histories" add column if not exists "description" text null;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(
			`alter table if exists "import_histories" drop column if exists "description";`,
		);
	}
}
