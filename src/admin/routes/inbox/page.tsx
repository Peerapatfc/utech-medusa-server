import { defineRouteConfig } from '@medusajs/admin-sdk';
import { ChatBubbleLeftRight } from '@medusajs/icons';
import { Container, Heading, Badge } from '@medusajs/ui';
import FilterInbox from './components/filter-inbox';
import TableInbox from './components/table-inbox';
import { useContactUs } from '../../hooks/api/contact-us';
import { useState, useEffect, useCallback } from 'react';
import type { ContactUsFilters } from '../../../types/contact-us';

const InboxPage = () => {
	const [unreadCount, setUnreadCount] = useState<number>(0);

	const [filters, setFilters] = useState<ContactUsFilters>({
		email: '',
		date: '',
		status: '',
	});
	const limit = 20;
	const [offset, setOffset] = useState(0);

	const { contactUs, isFetching, refetch } = useContactUs({
		...filters,
		limit,
		offset,
	});

	const fetchUnreadMessages = useCallback(async () => {
		try {
			const response = await fetch('/admin/contact-us/unread');

			if (!response.ok) {
				console.log('Failed to fetch unread messages');
				return;
			}

			const data = await response.json();
			setUnreadCount(data.unread);
		} catch (error) {
			console.error('Error fetching unread messages:', error);
		}
	}, []);

	useEffect(() => {
		fetchUnreadMessages();
	}, [fetchUnreadMessages]);

	const handleSubmit = (values: ContactUsFilters) => {
		if (
			filters.email === values.email &&
			filters.date === values.date &&
			filters.status === values.status
		) {
			return;
		}

		setOffset(0);
		setFilters(values);
		refetch();
		fetchUnreadMessages();
	};

	const handleReset = () => {
		if (filters.email === '' && filters.date === '' && filters.status === '') {
			return;
		}

		setFilters({ email: '', date: '', status: '' });
		refetch();
		fetchUnreadMessages();
	};

	return (
		<Container className='p-0'>
			<div className='flex flex-col gap-y-2 px-6 py-4'>
				<div className='flex items-center gap-x-5'>
					<Heading level='h2' className='text-[20px] font-[600]'>
						Inbox
					</Heading>
					{unreadCount > 0 && (
						<Badge color='blue'>New Messages {unreadCount}</Badge>
					)}
				</div>
				<p className='text-[14px]'>All message(s) from contact us</p>
			</div>
			<hr />
			<FilterInbox
				filters={filters}
				onSubmit={handleSubmit}
				onReset={handleReset}
			/>

			{contactUs && (
				<TableInbox
					contactUsList={contactUs}
					isFetching={isFetching}
					limit={limit}
					offset={offset}
					setOffset={setOffset}
					setUnreadCount={setUnreadCount}
				/>
			)}
		</Container>
	);
};

export const config = defineRouteConfig({
	label: 'Inbox',
	icon: ChatBubbleLeftRight,
});

export default InboxPage;
