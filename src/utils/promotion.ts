import type { CustomPromotion } from '@customTypes/promotion';
import dayjs from 'dayjs';

export const isWithinPeriod = (promotion: CustomPromotion) => {
	const { campaign } = promotion;
	if (!campaign) return true;

	const { starts_at, ends_at } = campaign;
	if (!starts_at && !ends_at) return true;

	const now = dayjs();
	if (starts_at && ends_at) {
		const start = dayjs(starts_at);
		const end = dayjs(ends_at);
		return now.isAfter(start) && now.isBefore(end);
	}

	if (starts_at && !ends_at) {
		const start = dayjs(starts_at);
		return now.isAfter(start);
	}

	if (!starts_at && ends_at) {
		const end = dayjs(ends_at);
		return now.isBefore(end);
	}
};
