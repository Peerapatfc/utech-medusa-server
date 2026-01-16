import { z } from 'zod';

export type AdminValidateImportType = z.infer<typeof AdminValidateImportSchema>;
export const AdminValidateImportSchema = z.object({
	url: z.string(),
	import_type: z.enum(['product_price']),
});
