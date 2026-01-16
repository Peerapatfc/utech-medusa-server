import { Button, Container, Heading } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DataTable } from '../../../../../../components/table/data-table';
import { useDataTable } from '../../../../../../hooks/use-data-table';
import { useBroadCastsTableColumns } from './use-broadcasts-table-columns';
import { useBroadCastsTableFilters } from './use-broadcasts-table-filters';
import { useBroadCastsTableQuery } from './use-broadcasts-table-query';
import { BroadCastsTableStatusFilter } from './broadcasts-list-table-status-filter';
import type { StoreNotification } from '@customTypes/store-notification';
import { useEffect, useState } from 'react';
import { StoreNotificationStatusOptions } from '../../../../common/utils';
import type { CountStatus } from '../../../../common/constants';
import { getStoreNotificationLists } from '../../../../../../hooks/api/store-notifications';

const PAGE_SIZE = 20;

export const BroadCastsTable = () => {
	const { t } = useTranslation();

	const { searchQuery, raw } = useBroadCastsTableQuery({
		pageSize: PAGE_SIZE,
	});

	const [broadCastLists, setBroadCastsLists] = useState<StoreNotification[]>(
		[],
	);
	const [count, setCount] = useState<number>(0);
	const [countStatus, setCountStatus] = useState<CountStatus[]>([]);

	useEffect(() => {
		const fetch = async () => {
			const { store_notifications, count } =
				await getStoreNotificationLists(searchQuery);
			setBroadCastsLists(store_notifications);
			setCount(count);
		};
		fetch();
	}, [searchQuery]);

	useEffect(() => {
		const fetch = async () => {
			const countStatus: CountStatus[] = [];
			for await (const status of StoreNotificationStatusOptions) {
				const { count } = await getStoreNotificationLists(
					status.value !== '' ? `status=${status.value}` : '',
				);
				countStatus.push({
					label: status.label,
					value: status.value,
					count,
				});
			}
			setCountStatus(countStatus);
		};
		fetch();
	}, []);

	const filters = useBroadCastsTableFilters();
	const columns = useBroadCastsTableColumns();

	const { table } = useDataTable({
		data: broadCastLists || [],
		columns,
		count,
		enablePagination: true,
		getRowId: (row) => row.id,
		pageSize: PAGE_SIZE,
	});

	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<div>
					<Heading>{'Broadcasts'}</Heading>
					<BroadCastsTableStatusFilter countStatus={countStatus} />
				</div>
				<Button size='small' variant='secondary' asChild>
					<Link to='create'>{t('actions.create')}</Link>
				</Button>
			</div>
			<DataTable
				table={table}
				columns={columns}
				count={count}
				filters={filters}
				orderBy={[
					{ key: 'subject_line', label: 'Subject Line' },
					{ key: 'status', label: t('fields.status') },
					{ key: 'scheduled_at', label: 'Broadcast time' },
					{ key: 'created_at', label: t('fields.createdAt') },
					{ key: 'updated_at', label: t('fields.updatedAt') },
				]}
				queryObject={raw}
				pageSize={PAGE_SIZE}
				navigateTo={(row) => `${row.original.id}`}
				pagination
				search
			/>
		</Container>
	);
};
