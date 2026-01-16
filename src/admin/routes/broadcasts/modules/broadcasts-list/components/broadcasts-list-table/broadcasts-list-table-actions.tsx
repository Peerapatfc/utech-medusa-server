import {
	// ArrowPath,
	PencilSquare,
	// SquareTwoStack,
	Trash,
} from '@medusajs/icons';
// import type { HttpTypes } from '@medusajs/types';

import { useTranslation } from 'react-i18next';
import { ActionMenu } from '../../../../../../components/common/action-menu';
import type { StoreNotification } from '@customTypes/store-notification';
import { StoreNotificationStatus } from '../../../../common/constants';
import { useDeleteBroadCastsAction } from '../../../../common/hooks/use-delete-broadcasts-action';

type BroadCastsTableActionsProps = {
	broadCast: StoreNotification;
	editTo: string;
};

export const BroadCastsTableActions = ({
	broadCast,
	editTo,
}: BroadCastsTableActionsProps) => {
	const { t } = useTranslation();
	const handleDelete = useDeleteBroadCastsAction({ broadCast });
	let lists = [
		{
			actions: [
				{
					label: t('actions.edit'),
					to: editTo,
					icon: <PencilSquare />,
				},
			],
		},
		{
			actions: [
				{
					label: t('actions.delete'),
					onClick: handleDelete,
					icon: <Trash />,
				},
			],
		},
	];
	if (broadCast.status === StoreNotificationStatus.SENT) {
		lists = [
			// {
			// 	actions: [
			// 		{
			// 			label: 'Duplicate',
			// 			to: `${broadCast.id}/edit`,
			// 			icon: <SquareTwoStack />,
			// 		},
			// 	],
			// },
			// {
			// 	actions: [
			// 		{
			// 			label: 'Resend',
			// 			to: `${broadCast.id}/edit`,
			// 			icon: <ArrowPath />,
			// 		},
			// 	],
			// },
		];
	}
	if (broadCast.status === StoreNotificationStatus.FAILED) {
		lists = [
			// {
			// 	actions: [
			// 		{
			// 			label: 'Resend',
			// 			to: `${broadCast.id}/edit`,
			// 			icon: <ArrowPath />,
			// 		},
			// 	],
			// },
			{
				actions: [
					{
						label: t('actions.delete'),
						onClick: handleDelete,
						icon: <Trash />,
					},
				],
			},
		];
	}
	if (broadCast.status === StoreNotificationStatus.EXPIRED) {
		lists = [
			{
				actions: [
					{
						label: t('actions.delete'),
						onClick: handleDelete,
						icon: <Trash />,
					},
				],
			},
		];
	}

	if (lists.length > 0) {
		return <ActionMenu groups={lists} />;
	}
	return null;
};
