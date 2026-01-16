import { useTranslation } from 'react-i18next';
import { PlaceholderCell } from '../../common/placeholder-cell';

export const OrderNoCell = ({ orderNo }: { orderNo?: string }) => {
	if (!orderNo) {
		return <PlaceholderCell />;
	}

	return (
		<div className='text-ui-fg-subtle txt-compact-small flex h-full w-full items-center overflow-hidden'>
			<span className='truncate'>#{orderNo}</span>
		</div>
	);
};

export const OrderNoHeader = () => {
	const { t } = useTranslation();

	return (
		<div className='flex h-full w-full items-center'>
			{/* <span className='truncate'>{t('fields.order')}</span> */}
			<span className='truncate'>Order No.</span>
		</div>
	);
};
