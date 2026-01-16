import { z } from 'zod';

export type StoreGetNotificationsParams = z.infer<
	typeof StoreGetNotificationsParamsSchema
>;

export const StoreGetNotificationsParamsSchema = z.object({
	category: z.string().optional(),
	limit: z.coerce.number().default(10),
	offset: z.coerce.number().default(0),
});

export type StoreBulkReadNotificationsBody = z.infer<
	typeof StoreBulkReadNotificationsBodySchema
>;

export const StoreBulkReadNotificationsBodySchema = z.object({
	ids: z.array(z.string()).min(1).max(100),
});
