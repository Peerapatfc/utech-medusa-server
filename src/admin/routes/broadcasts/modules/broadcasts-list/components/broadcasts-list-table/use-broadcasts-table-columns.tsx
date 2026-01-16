import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { StatusCell } from '../../../../../../components/table/table-cells/common/status-cell';
import { TextHeader } from '../../../../../../components/table/table-cells/common/text-cell';
import { DateCell } from '../../../../../../components/table/table-cells/common/date-cell';
import {
	getBroadCastsStatus,
	StoreNotificationCategoryOptions,
} from '../../../../common/utils';
import { BroadCastsTableActions } from './broadcasts-list-table-actions';
import type { StoreNotification } from '@customTypes/store-notification';
import { StoreNotificationRecipientType } from '../../../../common/constants';
import type { CustomerDTO, CustomerGroupDTO } from '@medusajs/framework/types';
import BroadCastsDisplayTarget from '../../../../common/components/broadcasts-display-target';

// Extended StoreNotification type with customer data
interface EnrichedStoreNotification extends StoreNotification {
	customers?: CustomerDTO[];
	customer_groups?: CustomerGroupDTO[];
}

const columnHelper = createColumnHelper<EnrichedStoreNotification>();

export const useBroadCastsTableColumns = () => {
	const { t } = useTranslation();

	return useMemo(
		() => [
			columnHelper.accessor('subject_line', {
				header: () => <TextHeader text={'Subject Line'} />,
				cell: (info) => info.getValue(),
			}),
			columnHelper.accessor('category', {
				header: () => <TextHeader text={'Category'} />,
				cell: (info) =>
					StoreNotificationCategoryOptions.find(
						(option) => option.value === info.getValue(),
					)?.label ?? '',
			}),
			columnHelper.display({
				id: 'target',
				header: () => <TextHeader text={'Target'} />,
				cell: ({ row }) => {
					if (
						row.original.recipient_type === StoreNotificationRecipientType.ALL
					) {
						return 'All subscribers';
					}
					if (
						row.original.recipient_type ===
						StoreNotificationRecipientType.TARGETING
					) {
						const allTargets = row.original.customer_groups?.map(
							(group) => group.name,
						);
						return <BroadCastsDisplayTarget allTargets={allTargets} />;
					}
					if (
						row.original.recipient_type ===
						StoreNotificationRecipientType.SPECIFIC
					) {
						const allTargets = row.original.customers?.map(
							(group) => group.email,
						);
						return <BroadCastsDisplayTarget allTargets={allTargets} />;
					}
				},
			}),
			columnHelper.accessor('scheduled_at', {
				header: () => <TextHeader text={'Broadcast time'} />,
				cell: ({ getValue }) => {
					const date = new Date(getValue() ?? '');
					return <DateCell date={date} />;
				},
			}),
			columnHelper.display({
				id: 'recipients',
				header: () => <TextHeader text={'Recipients'} />,
				cell: () => 0,
			}),
			columnHelper.accessor('status', {
				header: 'Status',
				cell: ({ row }) => {
					const { color, text } = getBroadCastsStatus(t, row.original);
					return <StatusCell color={color}>{text}</StatusCell>;
				},
			}),
			columnHelper.display({
				id: 'actions',
				cell: ({ row }) => (
					<BroadCastsTableActions
						broadCast={row.original}
						editTo={`${row.original.id}/edit`}
					/>
				),
			}),
		],
		[t],
	);
};
