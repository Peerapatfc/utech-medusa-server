import type { FetchError } from '@medusajs/js-sdk';
import {
	type QueryKey,
	type UseQueryOptions,
	useQuery,
} from '@tanstack/react-query';
import type { ContactUsResponse } from '../../../types/contact-us';
import { queryKeysFactory } from '../../lib/query-key-factory';

const CONTACT_US_QUERY_KEY = 'contact-us';
export const contactUsQueryKeys = queryKeysFactory(CONTACT_US_QUERY_KEY);

export const useContactUs = ({
	limit = 20,
	offset = 0,
	email = '',
	date = '',
	status = '',
	options,
}: {
	limit?: number;
	offset?: number;
	email?: string;
	date?: string;
	status?: 'read' | 'unread' | '';
	options?: Omit<
		UseQueryOptions<ContactUsResponse, FetchError, ContactUsResponse, QueryKey>,
		'queryFn' | 'queryKey'
	>;
}) => {
	const queryKey = contactUsQueryKeys.list({
		limit,
		offset,
		email,
		date,
		status,
	});

	const result = useQuery({
		queryKey,
		queryFn: async () => {
			const queryParams = new URLSearchParams();
			queryParams.append('limit', String(limit));
			queryParams.append('offset', String(offset));
			if (email) queryParams.append('email', email);
			if (date) queryParams.append('date', date);
			if (status) queryParams.append('status', status);

			const response = await fetch(
				`/admin/contact-us?${queryParams.toString()}`,
				{
					credentials: 'include',
				},
			);

			return response.json();
		},
		placeholderData: (previousData) => previousData,
		...options,
	});
	return {
		contactUs: result.data,
		isLoading: result.isLoading,
		isFetching: result.isFetching,
		refetch: result.refetch,
	};
};
