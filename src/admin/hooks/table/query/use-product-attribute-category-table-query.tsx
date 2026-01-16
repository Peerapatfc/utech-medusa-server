import { useQueryParams } from '../../use-query-params';

export interface AdminProductAttributeCategoryListParams {
	limit?: number;
	offset?: number;
	q?: string;
	order?: string;
}

type UseProductAttributeCategoryTableQueryProps = {
	prefix?: string;
	pageSize?: number;
};

export const useProductAttributeCategoryTableQuery = ({
	prefix,
	pageSize = 20,
}: UseProductAttributeCategoryTableQueryProps) => {
	const queryObject = useQueryParams(['offset', 'order', 'q'], prefix);

	const { offset, order, q } = queryObject;

	const initialSearchParams: AdminProductAttributeCategoryListParams = {
		limit: pageSize,
		offset: offset ? Number(offset) : 0,
		order: order,
		q,
	};

	const searchParams = Object.fromEntries(
		Object.entries(initialSearchParams).filter(
			([, value]) => value !== undefined && value !== null && value !== '',
		),
	);

	return {
		searchParams,
		raw: queryObject,
	};
};
