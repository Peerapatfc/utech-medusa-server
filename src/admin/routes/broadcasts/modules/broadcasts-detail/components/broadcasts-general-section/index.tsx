import { Container, Heading, StatusBadge, Text } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import {
	getBroadCastsStatus,
	StoreNotificationCategoryOptions,
} from '../../../../common/utils';
import type { StoreNotification } from '@customTypes/store-notification';
import { StoreNotificationRecipientType } from '../../../../common/constants';
import type {
	CustomerDTO,
	CustomerGroupDTO,
	UserDTO,
} from '@medusajs/framework/types';
import { DateCell } from '../../../../../../components/table/table-cells/common/date-cell';
import { Link } from 'react-router-dom';
import BroadCastsDisplayTarget from '../../../../common/components/broadcasts-display-target';
import { BroadCastsTableActions } from '../../../broadcasts-list/components/broadcasts-list-table/broadcasts-list-table-actions';

interface EnrichedStoreNotification extends StoreNotification {
	customers?: CustomerDTO[];
	customer_groups?: CustomerGroupDTO[];
	created_by_user?: UserDTO[];
	updated_by_user?: UserDTO[];
}

type BroadCastsGeneralSectionProps = {
	broadCast: EnrichedStoreNotification;
};

export const BroadCastsGeneralSection = ({
	broadCast,
}: BroadCastsGeneralSectionProps) => {
	const { t } = useTranslation();

	const { color, text } = getBroadCastsStatus(t, broadCast);

	const created_by_user = broadCast.created_by_user?.[0];
	const updated_by_user = broadCast.updated_by_user?.[0];

	const allCustomers = broadCast.customers?.map((group) => group.email);
	const allCustomerGroups = broadCast.customer_groups?.map(
		(group) => group.name,
	);

	return (
		<Container className='divide-y p-0'>
			<div className='flex items-center justify-between px-6 py-4'>
				<Heading>{'Broadcast details'}</Heading>
				<div className='flex items-center gap-x-4'>
					<BroadCastsTableActions broadCast={broadCast} editTo='edit' />
				</div>
			</div>
			<div className='text-ui-fg-subtle pt-4'>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold  text-white'
					>
						{'Broadcast ID'}
					</Text>
					<Text size='small' className='text-pretty col-span-12 md:col-span-10'>
						{broadCast.id}
					</Text>
				</div>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold  text-white'
					>
						{'Status'}
					</Text>
					<div className='text-pretty col-span-12 md:col-span-10'>
						<StatusBadge color={color}>{text}</StatusBadge>
					</div>
				</div>
			</div>
			<div className='text-ui-fg-subtle pt-4'>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold text-white'
					>
						{'Subject Line'}
					</Text>
					<Text size='small' className='text-pretty col-span-12 md:col-span-10'>
						{broadCast.subject_line}
					</Text>
				</div>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold text-white'
					>
						{'Description'}
					</Text>
					<Text size='small' className='text-pretty col-span-12 md:col-span-10'>
						{broadCast.description}
					</Text>
				</div>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold text-white'
					>
						{'Category'}
					</Text>
					<Text size='small' className='text-pretty col-span-12 md:col-span-10'>
						{StoreNotificationCategoryOptions.find(
							(option) => option.value === broadCast.category,
						)?.label ?? ''}
					</Text>
				</div>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold text-white'
					>
						{'Media'}
					</Text>
					<div className='text-pretty col-span-12 md:col-span-10'>
						{broadCast.image_url && (
							<Link to={broadCast.image_url} target='_blank'>
								<img
									src={broadCast.image_url}
									alt='broadcasts-media'
									className='w-2/3 object-cover object-center'
								/>
							</Link>
						)}
					</div>
				</div>
			</div>
			<div className='text-ui-fg-subtle pt-4'>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold text-white'
					>
						{'Target'}
					</Text>
					<Text size='small' className='text-pretty col-span-12 md:col-span-10'>
						{broadCast.recipient_type === StoreNotificationRecipientType.ALL &&
							'All subscribers'}
						{broadCast.recipient_type ===
							StoreNotificationRecipientType.SPECIFIC && (
							<BroadCastsDisplayTarget
								allTargets={allCustomers}
								showAmount={100}
							/>
						)}
						{broadCast.recipient_type ===
							StoreNotificationRecipientType.TARGETING && (
							<BroadCastsDisplayTarget
								allTargets={allCustomerGroups}
								showAmount={100}
							/>
						)}
					</Text>
				</div>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold text-white'
					>
						{'Broadcast time'}
					</Text>
					<Text size='small' className='text-pretty col-span-12 md:col-span-10'>
						<DateCell date={broadCast.scheduled_at} />
					</Text>
				</div>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold text-white'
					>
						{'Updated on'}
					</Text>
					<Text size='small' className='text-pretty col-span-12 md:col-span-10'>
						<DateCell date={broadCast.updated_at} />
					</Text>
				</div>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold text-white'
					>
						{'Recipients'}
					</Text>
					<Text size='small' className='text-pretty col-span-12 md:col-span-10'>
						0
					</Text>
				</div>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold text-white'
					>
						{'A/B test'}
					</Text>
				</div>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold text-white'
					>
						{'Campaign'}
					</Text>
				</div>
			</div>
			<div className='text-ui-fg-subtle pt-4'>
				<div className='grid grid-cols-12 items-start px-6 pb-4'>
					<Text
						leading='compact'
						size='small'
						className='col-span-12 md:col-span-2 font-bold text-white'
					>
						{'Last updated by'}
					</Text>
					<Text size='small' className='text-pretty col-span-12 md:col-span-10'>
						{updated_by_user
							? `${updated_by_user.first_name} ${updated_by_user.last_name}`
							: created_by_user
								? `${created_by_user.first_name} ${created_by_user.last_name}`
								: ''}
					</Text>
				</div>
			</div>
		</Container>
	);
};
