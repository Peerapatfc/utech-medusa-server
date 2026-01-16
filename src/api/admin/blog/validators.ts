import { endOfDay, isAfter, isValid, parseISO } from 'date-fns';
import { z } from 'zod';

const dateStringSchema = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
	.refine((date) => isValid(parseISO(date)), 'Invalid date');

export const BlogPerformanceQueryParams = z
	.object({
		start_date: dateStringSchema,
		end_date: dateStringSchema,
	})
	.refine((data) => !isAfter(parseISO(data.start_date), endOfDay(new Date())), {
		message: 'Start date cannot be in the future',
		path: ['start_date'],
	})
	.refine(
		(data) =>
			!data.end_date ||
			!isAfter(parseISO(data.start_date), parseISO(data.end_date)),
		{
			message: 'End date must be after or equal to start date',
			path: ['end_date'],
		},
	);

export type BlogPerformanceQueryParamsType = z.infer<
	typeof BlogPerformanceQueryParams
>;
