import type { HttpTypes } from '@medusajs/types';
import { toast, usePrompt } from '@medusajs/ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export const useDeletePriceListAction = ({
	priceList,
}: {
	priceList: HttpTypes.AdminPriceList;
}) => {
	const { t } = useTranslation();
	const prompt = usePrompt();
	const navigate = useNavigate();

	const handleDelete = async () => {
		const res = await prompt({
			title: t('general.areYouSure'),
			description: t('priceLists.delete.confirmation', {
				title: priceList.title,
			}),
			confirmText: t('actions.delete'),
			cancelText: t('actions.cancel'),
		});

		if (!res) {
			return;
		}
		fetch(`/admin/custom/flash-sales/${priceList.id}`, {
			credentials: 'include',
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
		})
			.then((res) => res.json())
			.then(() => {
				toast.success(
					t('priceLists.delete.successToast', {
						title: priceList.title,
					}),
				);

				navigate('/flash-sale');
				setTimeout(() => {
					window.location.reload();
				}, 500);
			})
			.catch((e) => {
				toast.error(e.message);
			});
	};

	return handleDelete;
};
