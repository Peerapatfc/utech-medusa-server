import { z } from 'zod';

const BroadCastsCustomerGroupsArray = z.array(
	z.object({
		id: z.string(),
		name: z.string(),
		customers: z.number(),
	}),
);

export type BroadCastsCustomerGroupsArrayType = z.infer<
	typeof BroadCastsCustomerGroupsArray
>;

const BroadCastsCustomersArray = z.array(
	z.object({
		id: z.string(),
		email: z.string(),
		name: z.string(),
		has_account: z.boolean(),
	}),
);

export interface FileType {
	id: string;
	url: string;
	file: File;
}

export type BroadCastsCustomersArrayType = z.infer<
	typeof BroadCastsCustomersArray
>;

export const BroadCastsCreateSchema = z.object({
	subject_line: z.string().min(1).max(100),
	recipient_type: z.enum(['all', 'targeting', 'specific']),
	description: z.string().min(1),
	category: z.enum([
		'announcement',
		'promotion',
		'discount-code',
		'update-order',
		'blog',
	]),
	image_url: z
		.object({
			id: z.string(),
			url: z.string(),
			file: z.instanceof(File),
		})
		.optional(),
	customer_group_ids: BroadCastsCustomerGroupsArray.optional(),
	customer_ids: BroadCastsCustomersArray.optional(),
	status: z
		.enum(['draft', 'scheduled', 'sent', 'expired', 'failed'])
		.optional(),
	metadata: z.record(z.any()).optional(),
	broadcast_type: z.enum(['now', 'scheduled']),
	// isABTest: z.boolean().optional(),
	// isAssignToCampaign: z.boolean().optional(),
	scheduled_at: z.date().optional(),
});

export type BroadCastsCreateSchemaType = z.infer<typeof BroadCastsCreateSchema>;

export const BroadCastsDetailsSchema = BroadCastsCreateSchema.pick({
	recipient_type: true,
	broadcast_type: true,
	customer_group_ids: true,
	customer_ids: true,
	scheduled_at: true,
});

export const BroadCastsDetailsFields = Object.keys(
	BroadCastsDetailsSchema.shape,
) as (keyof typeof BroadCastsDetailsSchema.shape)[];
