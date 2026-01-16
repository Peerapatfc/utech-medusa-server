import { Button } from '@medusajs/ui';
import { StoreNotificationStatus, Tab } from '../../constants';
import { useTranslation } from 'react-i18next';

type BroadCastsPrimaryButtonFormProps = {
	tab: Tab;
	next: (tab: Tab) => void;
	isLoading?: boolean;
	broadcastType: string;
	handleBeforeSubmit: (status: StoreNotificationStatus) => void;
};

const BroadCastsPrimaryButtonForm = ({
	tab,
	next,
	isLoading,
	broadcastType,
	handleBeforeSubmit,
}: BroadCastsPrimaryButtonFormProps) => {
	const { t } = useTranslation();

	if (tab === Tab.BOARD_CAST) {
		return (
			<>
				<Button
					key='draft-button'
					type='button'
					variant='primary'
					size='small'
					isLoading={isLoading}
					onClick={() => handleBeforeSubmit(StoreNotificationStatus.DRAFT)}
				>
					{'Save as draft'}
				</Button>
				{broadcastType === 'now' ? (
					<Button
						key='send-now-button'
						type='button'
						variant='primary'
						size='small'
						isLoading={isLoading}
						onClick={() => handleBeforeSubmit(StoreNotificationStatus.SENT)}
					>
						{'Send now'}
					</Button>
				) : (
					<Button
						key='schedule-button'
						type='button'
						variant='primary'
						size='small'
						isLoading={isLoading}
						onClick={() =>
							handleBeforeSubmit(StoreNotificationStatus.SCHEDULED)
						}
					>
						{'Schedule broadcast'}
					</Button>
				)}
			</>
		);
	}

	return (
		<Button
			key='next-button'
			type='button'
			variant='primary'
			size='small'
			onClick={() => next(tab)}
		>
			{t('actions.continue')}
		</Button>
	);
};

export default BroadCastsPrimaryButtonForm;
