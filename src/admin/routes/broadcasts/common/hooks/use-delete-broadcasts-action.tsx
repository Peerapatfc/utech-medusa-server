import type { StoreNotification } from '@customTypes/store-notification';
import { toast, usePrompt } from '@medusajs/ui';
import { deleteStoreNotificationById } from '../../../../hooks/api/store-notifications';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const useDeleteBroadCastsAction = ({
	broadCast,
}: {
	broadCast: StoreNotification;
}) => {
	const { t } = useTranslation();
	const prompt = usePrompt();
	const navigate = useNavigate();

	const handleDelete = async () => {
		const res = await prompt({
			title: 'Delete broadcast',
			description: 'Are you sure you want to delete this broadcast?',
			confirmText: t('actions.delete'),
			cancelText: t('actions.cancel'),
		});

		if (!res) {
			return;
		}

		await deleteStoreNotificationById(broadCast.id);
		toast.success(
			`Broadcast ${broadCast.subject_line} was successfully deleted.`,
		);
		navigate('/broadcasts');
		setTimeout(() => {
			window.location.reload();
		}, 1000);
	};

	return handleDelete;
};
