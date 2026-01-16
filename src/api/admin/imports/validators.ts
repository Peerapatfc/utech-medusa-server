import { z } from 'zod';

export type AdminImportType = z.infer<typeof AdminImportSchema>;
export const AdminImportSchema = z.object({
	id: z.string(),
	url: z.string(),
	import_type: z.enum(['product_price']),
	original_filename: z.string(),
	description: z.string().optional(),
});
