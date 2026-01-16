import type { FindParams } from '@medusajs/types';
import { useQueryParams } from '../../use-query-params';

type UsePreOrderTemplateTableQueryProps = {
	prefix?: string;
	pageSize?: number;
};

export const usePreOrderTemplateTableQuery = ({
	prefix,
	pageSize = 20,
}: UsePreOrderTemplateTableQueryProps) => {
	const queryObject = useQueryParams(
		['offset', 'q', 'created_at', 'updated_at'],
		prefix,
	);

	const { offset, q, created_at, updated_at } = queryObject;

	const searchParams: FindParams & {
		created_at: string;
		updated_at: string;
		q: string | undefined;
	} = {
		limit: pageSize,
		offset: offset ? Number(offset) : 0,
		created_at: created_at ? JSON.parse(created_at) : undefined,
		updated_at: updated_at ? JSON.parse(updated_at) : undefined,
		q,
	};

	return {
		searchParams,
		raw: queryObject,
	};
};
