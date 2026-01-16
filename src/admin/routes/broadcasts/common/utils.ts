import type { TFunction } from 'i18next';
import { StoreNotificationStatus } from './constants';
import type { StoreNotification } from '@customTypes/store-notification';

export const getBroadCastsStatus = (
	t: TFunction<'translation'>,
	broadCast: StoreNotification,
) => {
	let text = '';
	let color: 'red' | 'grey' | 'orange' | 'green' = 'green';
	let status: string = StoreNotificationStatus.DRAFT;

	if (broadCast.status === 'draft') {
		color = 'grey';
		text = 'Drafts';
		status = StoreNotificationStatus.DRAFT;
	}

	if (broadCast.status === 'scheduled') {
		color = 'orange';
		text = t('priceLists.fields.status.options.scheduled');
		status = StoreNotificationStatus.SCHEDULED;
	}

	if (broadCast.status === 'sent') {
		color = 'green';
		text = 'Sent';
		status = StoreNotificationStatus.SENT;
	}

	if (broadCast.status === 'failed') {
		color = 'red';
		text = 'Failed';
		status = StoreNotificationStatus.EXPIRED;
	}

	if (broadCast.status === 'expired') {
		color = 'red';
		text = t('priceLists.fields.status.options.expired');
		status = StoreNotificationStatus.EXPIRED;
	}

	return {
		color,
		text,
		status,
	};
};

export const humanFileSize = (bytes: number, si = false, dp = 1) => {
	const thresh = si ? 1000 : 1024;

	if (Math.abs(bytes) < thresh) {
		return `${bytes} B`;
	}

	const units = si
		? ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
	let u = -1;
	const r = 10 ** dp;

	do {
		// biome-ignore lint/style/noParameterAssign: <explanation>
		bytes /= thresh;
		++u;
	} while (
		Math.round(Math.abs(bytes) * r) / r >= thresh &&
		u < units.length - 1
	);

	return `${bytes.toFixed(dp)}${units[u]}`;
};

export const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif'];

export const SUPPORTED_FORMATS_FILE_EXTENSIONS = ['.jpeg', '.png', '.gif'];

export const StoreNotificationStatusOptions = [
	{
		value: '',
		label: 'All broadcasts',
	},
	{
		value: 'draft',
		label: 'Draft',
	},
	{
		value: 'scheduled',
		label: 'Scheduled',
	},
	{
		value: 'sent',
		label: 'Sent',
	},
	{
		value: 'expired',
		label: 'Expired',
	},
	{
		value: 'failed',
		label: 'Failed',
	},
];

export const StoreNotificationCategoryOptions = [
	{
		value: 'announcement',
		label: 'Announcement',
	},
	{
		value: 'promotion',
		label: 'Promotion',
	},
	{
		value: 'discount-code',
		label: 'Discount Code',
	},
	{
		value: 'update-order',
		label: 'Update Order',
	},
	{
		value: 'blog',
		label: 'Blog',
	},
];
