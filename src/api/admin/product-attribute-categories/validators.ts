import { z } from 'zod';

export const AdminPostProductAttributeCategoriesReq = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	rank: z.number().optional(),
	status: z.boolean().optional(),
	metadata: z.record(z.unknown()).optional(),
});

export type AdminPostProductAttributeCategoriesParamsType = z.infer<
	typeof AdminPostProductAttributeCategoriesReq
>;

// Wrap the array in an object for the PUT request body
export const AdminPutProductAttributeCategoriesBody = z.object({
	categories: z.array(
		z.object({
			id: z.string().min(1, 'ID is required'),
			rank: z.number(),
		}),
	),
});

export type AdminPutProductAttributeCategoriesBodyType = z.infer<
	typeof AdminPutProductAttributeCategoriesBody
>;

// Keep the old type for the service layer if it expects a direct array
export const AdminPutProductAttributeCategoriesReq = z.array(
	z.object({
		id: z.string().min(1, 'ID is required'),
		rank: z.number(),
	}),
);

export type AdminPutProductAttributeCategoriesParamsType = z.infer<
	typeof AdminPutProductAttributeCategoriesReq
>;

// Schema for GET request query parameters
export const AdminGetProductAttributeCategoriesParams = z.object({
	q: z.string().optional(),
	limit: z.coerce.number().default(20),
	offset: z.coerce.number().default(0),
	order: z.string().optional(),
});

export type AdminGetProductAttributeCategoriesParamsType = z.infer<
	typeof AdminGetProductAttributeCategoriesParams
>;
