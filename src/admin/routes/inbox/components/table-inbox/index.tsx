import type { ContactUsResponse, ContactUs } from '@customTypes/contact-us';
import { Table, StatusBadge } from '@medusajs/ui';
import { dateFormat } from '../../../../lib/date';
import TableInboxSkeleton from './table-inbox-skeleton';
import { useState } from 'react';
import ModalInbox from '../modal-inbox';

type TableInboxProps = {
	contactUsList: ContactUsResponse;
	isFetching: boolean;
	limit: number;
	offset: number;
	setOffset: (offset: number) => void;
	setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
};

const tableHeaders = [
	'No.',
	'Received Date',
	'Name',
	'Message',
	'Email',
	'Status',
];

const TableInbox = ({
	contactUsList,
	isFetching,
	limit,
	offset,
	setOffset,
	setUnreadCount,
}: TableInboxProps) => {
	const [readMessages, setReadMessages] = useState<string[]>([]);

	const [selectedMessage, setSelectedMessage] = useState<ContactUs | null>(
		null,
	);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const totalPages = Math.ceil(contactUsList.count / limit);
	const currentPage = Math.floor(offset / limit);
	const pageSize = limit;

	const canPreviousPage = offset > 0;
	const canNextPage = offset + limit < contactUsList.count;

	const nextPage = () => {
		if (canNextPage) {
			setOffset(offset + limit);
		}
	};

	const previousPage = () => {
		if (canPreviousPage) {
			setOffset(offset - limit);
		}
	};

	const markAsRead = async (contactUsId: string) => {
		try {
			const response = await fetch(`/admin/contact-us/${contactUsId}/read`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new Error('Failed to update read status');
			}

			return true;
		} catch (error) {
			console.error('Error updating read status:', error);
			return false;
		}
	};

	const renderMessage = (message: string) => {
		const maxLength = 50;
		if (message.length > maxLength) {
			return (
				<>
					{message.substring(0, maxLength)}....{' '}
					<span className='text-blue-500 hover:underline underline-offset-2 cursor-pointer'>
						(view more)
					</span>
				</>
			);
		}
		return message;
	};

	const handleRead = async (contactUsDetail: ContactUs) => {
		try {
			setReadMessages((prev) => [...prev, contactUsDetail.id]);
			setUnreadCount((prev) => Math.max(0, prev - 1));
			setSelectedMessage(contactUsDetail);
			setIsModalOpen(true);

			await markAsRead(contactUsDetail.id);
		} catch (error) {
			console.error('Error marking as read:', error);
		}
	};

	return (
		<div>
			<Table>
				<Table.Header>
					<Table.Row>
						{tableHeaders.map((header) => (
							<Table.HeaderCell key={header}>{header}</Table.HeaderCell>
						))}
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{isFetching ? (
						<>
							<TableInboxSkeleton />
							<TableInboxSkeleton />
							<TableInboxSkeleton />
							<TableInboxSkeleton />
						</>
					) : contactUsList.data.length > 0 ? (
						contactUsList.data.map((item, index) => (
							<Table.Row
								key={item.id}
								onClick={() => handleRead(item)}
								className='cursor-pointer'
							>
								<Table.Cell>{offset + index + 1}</Table.Cell>
								<Table.Cell>{dateFormat(item.created_at)}</Table.Cell>
								<Table.Cell>{item.name}</Table.Cell>
								<Table.Cell>{renderMessage(item.message)}</Table.Cell>
								<Table.Cell>{item.email}</Table.Cell>
								<Table.Cell>
									{readMessages.includes(item.id) || item.is_read ? (
										<StatusBadge color='green'>Read</StatusBadge>
									) : (
										<StatusBadge color='red'>Unread</StatusBadge>
									)}
								</Table.Cell>
							</Table.Row>
						))
					) : (
						<tr>
							<td colSpan={6} className='text-center py-4'>
								No Data Found
							</td>
						</tr>
					)}
				</Table.Body>
			</Table>

			<Table.Pagination
				count={contactUsList.count}
				pageSize={pageSize}
				pageIndex={currentPage}
				pageCount={totalPages}
				canPreviousPage={canPreviousPage}
				canNextPage={canNextPage}
				previousPage={previousPage}
				nextPage={nextPage}
			/>

			{selectedMessage && (
				<ModalInbox
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					message={selectedMessage}
				/>
			)}
		</div>
	);
};

export default TableInbox;
