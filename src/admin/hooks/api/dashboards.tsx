import type { FetchError } from '@medusajs/js-sdk';
import {
	type QueryKey,
	type UseQueryOptions,
	useQuery,
} from '@tanstack/react-query';
import type { Dashboard, DashboardDataInsight } from '../../../types/dashboard';
import { queryKeysFactory } from '../../lib/query-key-factory';

const DASHBOARD_QUERY_KEY = 'dashboard' as const;
export const dashboardQueryKeys = queryKeysFactory(DASHBOARD_QUERY_KEY);
const DASHBOARD_DATA_INSIGHT_QUERY_KEY = 'dashboard-data-insight' as const;
export const dashboardDataInSightQueryKeys = queryKeysFactory(
	DASHBOARD_DATA_INSIGHT_QUERY_KEY,
);

export const useDashboard = (
	options?: Omit<
		UseQueryOptions<Dashboard, FetchError, Dashboard, QueryKey>,
		'queryFn' | 'queryKey'
	>,
) => {
	const result = useQuery({
		queryKey: dashboardQueryKeys.list(),
		queryFn: async () => {
			const response = await fetch('/admin/dashboard', {
				credentials: 'include',
			});
			return response.json();
		},
		...options,
	});

	return { dashboard: result.data, isLoading: result.isLoading };
};

export const useDashboardDataInSight = (
	options?: Omit<
		UseQueryOptions<
			DashboardDataInsight,
			FetchError,
			DashboardDataInsight,
			QueryKey
		>,
		'queryFn' | 'queryKey'
	>,
) => {
	const result = useQuery({
		queryKey: dashboardDataInSightQueryKeys.list(),
		queryFn: async () => {
			const response = await fetch('/admin/dashboard/data-insight', {
				credentials: 'include',
			});
			return response.json();
		},
		...options,
	});

	return { dashboard: result.data, isLoading: result.isLoading };
};
