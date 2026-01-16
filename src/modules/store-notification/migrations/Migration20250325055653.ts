import { Migration } from '@mikro-orm/migrations';

export class Migration20250325055653 extends Migration {
	override async up(): Promise<void> {
		this.addSql(
			`create table if not exists "store_notification" ("id" text not null, "subject_line" text not null, "description" text not null, "category" text check ("category" in ('announcement', 'promotion', 'discount-code', 'update-order', 'blog')) not null default 'announcement', "image_url" text not null, "recipient_type" text check ("recipient_type" in ('all', 'targeting', 'specific')) not null default 'all', "customer_group_ids" text[] null, "customer_ids" text[] null, "status" text check ("status" in ('draft', 'scheduled', 'sent', 'expired', 'failed')) not null default 'draft', "metadata" jsonb null, "broadcast_type" text check ("broadcast_type" in ('now', 'scheduled')) not null, "scheduled_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "store_notification_pkey" primary key ("id"));`,
		);
		this.addSql(
			`CREATE INDEX IF NOT EXISTS "IDX_store_notification_deleted_at" ON "store_notification" (deleted_at) WHERE deleted_at IS NULL;`,
		);
	}

	override async down(): Promise<void> {
		this.addSql(`drop table if exists "store_notification" cascade;`);
	}
}
